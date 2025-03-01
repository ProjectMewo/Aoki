import AokiClient from "../../struct/Client";
import { Guild, GuildMember } from "discord.js";

interface VerificationData {
  id: string;
  state: string;
  createdat: number;
  guildid: string;
}

interface OsuTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface OsuUser {
  id: number;
  username: string;
  playmode: string;
  country: {
    code: string;
  };
}

// main function file for verification
// exists on one guild as a test, will release later
export default class VerificationHandler {
  private client: AokiClient;
  private OSU_CLIENT_ID: string;
  private OSU_SECRET: string;
  private REDIRECT_URI: string;
  private AUTH_URL: string;
  private TOKEN_URL: string;
  private USER_INFO_URL: string;
  private VERIFY_ROLE: string;
  private VIETNAM_ROLE: string;

  constructor(client: AokiClient) {
    this.client = client;
    this.OSU_CLIENT_ID = client.dev ? process.env.OSU_DEV_ID! : process.env.OSU_ID!;
    this.OSU_SECRET = client.dev ? process.env.OSU_DEV_SECRET! : process.env.OSU_SECRET!;
    this.REDIRECT_URI = client.dev ? "http://localhost:8080/callback" : "https://aoki.hackers.moe/callback";
    this.AUTH_URL = "https://osu.ppy.sh/oauth/authorize";
    this.TOKEN_URL = "https://osu.ppy.sh/oauth/token";
    this.USER_INFO_URL = "https://osu.ppy.sh/api/v2/me";
    this.VERIFY_ROLE = "Member";
    this.VIETNAM_ROLE = "Vietnamese";
  }

  async verify(url: URL): Promise<Response> {
    const guildId = url.searchParams.get('guildId');
    const userId = url.searchParams.get('userId');
    if (!guildId || !userId) {
      return new Response('Missing guildId or userId', { status: 400 });
    }
    return this.handleLogin(url);
  }

  async handleLogin(url: URL): Promise<Response> {
    const id = url.searchParams.get("id");
    const guildid = url.searchParams.get("guildId");
    if (!id || !guildid) {
      return new Response('Missing id or guildId', { status: 400 });
    }

    // structure the state
    // to retrieve, use state.split("_");
    const state = `${id}_${guildid}_${Date.now()}`;
    await this.client.settings.verifications.update(id, { state, createdat: Date.now(), guildid });

    const authUrl = `${this.AUTH_URL}?response_type=code&client_id=${this.OSU_CLIENT_ID}&redirect_uri=${this.REDIRECT_URI}&scope=identify&state=${state}`;
    return new Response(null, {
      status: 302,
      headers: { Location: authUrl },
    });
  }

  async customizeVerificationMessage(guildId: string, customization: Record<string, any>): Promise<void> {
    await this.client.settings.guilds.update(guildId, {
      verification: {
        ...customization,
        status: true
      }
    });
  }

  async handleCallback(url: URL): Promise<Response> {
    try {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state) {
        throw new Error("Missing code or state");
      }

      const tokenData = await this.exchangeCodeForToken(code);
      const user = await this.fetchOsuUserData(tokenData.access_token);
      const verificationData = await this.client.settings.verifications.findOne("state", state) as VerificationData | null;

      if (!verificationData) {
        throw new Error("Invalid or expired state");
      }

      await this.saveUserData(verificationData.id, user);
      await this.grantRoles(verificationData.id, verificationData.guildid, user);

      return new Response("Verification successful. You can now return to Discord.", { status: 200 });
    } catch (err) {
      console.error("Error during verification process:", err);
      return new Response((err as Error).message || "An error occurred during verification", { status: 500 });
    }
  }

  async grantRoles(id: string, guildId: string, user: OsuUser): Promise<Response> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      return new Response("Guild not found", { status: 404 });
    }

    const member = await this.fetchMember(guild, id);
    if (!member) {
      return new Response("Member not found in guild", { status: 404 });
    }

    // Special case for the specific guild with two-role verification
    if (guildId === process.env.VERIF_GUILD) {
      const memberRole = guild.roles.cache.find((r) => r.name === this.VERIFY_ROLE);
      if (memberRole) await member.roles.add(memberRole);

      const vnRole = guild.roles.cache.find((r) => r.name === this.VIETNAM_ROLE);
      if (user.country.code.toLowerCase() === "vn" && vnRole) {
        await member.roles.add(vnRole);
      }
    }

    const guildSettings = await this.client.settings.guilds.findOne("id", guildId);

    if (!(guildSettings as any).verificationstatus) {
      return new Response("Verification is not enabled for this server.", { status: 400 });
    }

    const role = guild.roles.cache.get((guildSettings as any).verificationroleid);
    if (!role) {
      return new Response("Verification role not found. Please contact the server administrator.", { status: 500 });
    }

    await member.roles.add(role);

    return new Response("Verification successful. You can now return to Discord.", { status: 200 });
  }

  /**
   * Exchange the OAuth2 code for an access token.
   * @param {string} code The OAuth2 authorization code.
   */
  private async exchangeCodeForToken(code: string): Promise<OsuTokenResponse> {
    const response = await fetch(this.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.OSU_CLIENT_ID,
        client_secret: this.OSU_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    return await response.json();
  }

  /**
   * Fetch osu! user data using the access token.
   * @param {string} accessToken The access token.
   */
  private async fetchOsuUserData(accessToken: string): Promise<OsuUser> {
    const response = await fetch(this.USER_INFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch osu! user data");
    }

    return await response.json();
  }

  /**
   * Save user data in the database.
   * @param {string} id The Discord user ID.
   * @param {OsuUser} user The osu! user data.
   */
  private async saveUserData(id: string, user: OsuUser): Promise<void> {
    const defaultmode = this.client.util.osuNumberModeFormat(user.playmode);
    await this.client.settings.users.update(id, {
      ingamename: user.username,
      defaultmode,
    });
  }

  /**
   * Fetch a member from the guild, either from cache or via API
   * @param {Guild} guild The guild object
   * @param {string} id The Discord user ID
   * @returns {Promise<GuildMember | null>} The guild member or null if not found
   */
  private async fetchMember(guild: Guild, id: string): Promise<GuildMember | null> {
    let member = guild.members.cache.get(id);
    if (!member) {
      try {
        member = await guild.members.fetch(id);
      } catch (error) {
        console.error(`Failed to fetch member ${id}:`, error);
        return null;
      }
    }
    return member;
  }
}
