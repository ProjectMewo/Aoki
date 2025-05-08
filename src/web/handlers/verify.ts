import AokiClient from "../../struct/Client";
import { Guild, GuildMember } from "discord.js";
import { GuildSettings, UserSettings } from "@local-types/settings";
import BaseHandler from "./BaseHandler";

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

/**
 * Handler for osu! account verification routes
 */
export default class VerificationHandler extends BaseHandler {
  private OSU_CLIENT_ID: string;
  private OSU_SECRET: string;
  private REDIRECT_URI: string;
  private AUTH_URL: string;
  private TOKEN_URL: string;
  private USER_INFO_URL: string;
  private VERIFY_ROLE: string;
  private VIETNAM_ROLE: string;

  constructor(client: AokiClient) {
    super(client);
    this.OSU_CLIENT_ID = client.dev ? process.env.OSU_DEV_ID! : process.env.OSU_ID!;
    this.OSU_SECRET = client.dev ? process.env.OSU_DEV_SECRET! : process.env.OSU_SECRET!;
    this.REDIRECT_URI = client.dev ? "http://localhost:8080/callback" : "https://aoki.hackers.moe/callback";
    this.AUTH_URL = "https://osu.ppy.sh/oauth/authorize";
    this.TOKEN_URL = "https://osu.ppy.sh/oauth/token";
    this.USER_INFO_URL = "https://osu.ppy.sh/api/v2/me";
    this.VERIFY_ROLE = "Member";
    this.VIETNAM_ROLE = "Vietnamese";
  }

  /**
   * Handle verification initiation
   * @param url The request URL
   */
  public async verify(url: URL): Promise<Response> {
    const guildId = url.searchParams.get('guildId');
    const userId = url.searchParams.get('userId');
    
    if (!guildId || !userId) {
      return this.errorResponse('Missing guildId or userId');
    }
    
    return this.handleLogin(url);
  }

  /**
   * Handle osu! OAuth login
   * @param url The request URL
   */
  public async handleLogin(url: URL): Promise<Response> {
    const id = url.searchParams.get("id");
    const guildid = url.searchParams.get("guildId");
    
    if (!id || !guildid) {
      return this.errorResponse('Missing id or guildId');
    }

    // Structure the state to retrieve user data after callback
    const state = `${id}_${guildid}_${Date.now()}`;
    await this.client.settings.verifications.update(id, { state, createdat: Date.now(), guildid });

    const authUrl = `${this.AUTH_URL}?response_type=code&client_id=${this.OSU_CLIENT_ID}&redirect_uri=${this.REDIRECT_URI}&scope=identify&state=${state}`;
    return this.redirectResponse(authUrl);
  }

  /**
   * Handle OAuth callback from osu!
   * @param url The request URL
   */
  public async handleCallback(url: URL): Promise<Response> {
    try {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      
      if (!code || !state) {
        return this.errorResponse("Missing code or state", 400);
      }

      const tokenData = await this.exchangeCodeForToken(code);
      const user = await this.fetchOsuUserData(tokenData.access_token);
      const verificationData = await this.client.settings.verifications.findOne({ state }) as VerificationData | null;

      if (!verificationData) {
        return this.errorResponse("Invalid or expired state", 400);
      }

      await this.saveUserData(verificationData.id, user);
      await this.grantRoles(verificationData.id, verificationData.guildid, user);

      return this.textResponse("Verification successful. You can now return to Discord.");
    } catch (err) {
      console.error("Error during verification process:", err);
      return this.errorResponse((err as Error).message || "An error occurred during verification", 500);
    }
  }

  /**
   * Grant roles to the user based on verification data and guild settings
   * @param id User ID
   * @param guildId Guild ID
   * @param user osu! user data
   */
  private async grantRoles(id: string, guildId: string, user: OsuUser): Promise<Response | void> {
    const guild = this.client.guilds.cache.get(guildId);
    if (!guild) {
      return this.errorResponse("Guild not found", 404);
    }

    const member = await this.fetchMember(guild, id);
    if (!member) {
      return this.errorResponse("Member not found in guild", 404);
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

    const guildSettings = await this.client.settings.guilds.findOne({ id: guildId }) as GuildSettings | null;

    if (!guildSettings) {
      return this.errorResponse("Guild settings not found", 500);
    }

    if (!guildSettings.verification.status) 
      return this.errorResponse("Verification is not enabled for this server.", 400);

    const role = guild.roles.cache.get(guildSettings.verification.roleId!);
    if (!role) {
      return this.errorResponse("Verification role not found. Please contact the server administrator.", 500);
    }

    await member.roles.add(role);
  }

  /**
   * Exchange the OAuth2 code for an access token
   * @param code The OAuth2 authorization code
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
   * Fetch osu! user data using the access token
   * @param accessToken The access token
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
   * Save user data in the database
   * @param id The Discord user ID
   * @param user The osu! user data
   */
  private async saveUserData(id: string, user: OsuUser): Promise<void> {
    const defaultmode = this.client.utils.osu.numberModeFormat(user.playmode);
    // Check if this user allow us to save their osu! profile details
    const userSettings = await this.client.settings.users.findOne({ id }) as UserSettings | null;
    // If not, don't do anything and exit this function
    if (!userSettings?.saveOsuUserAccount) return;
    // Otherwise we save it like normal
    await this.client.settings.users.update(id, {
      ingamename: user.username,
      defaultmode,
    });
  }

  /**
   * Fetch a member from the guild, either from cache or via API
   * @param guild The guild object
   * @param id The Discord user ID
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
