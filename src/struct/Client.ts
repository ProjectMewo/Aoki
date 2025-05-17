// Essentials
import { Client } from "seyfert";
import { ActivityType, PresenceUpdateStatus } from "seyfert/lib/types";
import Settings from "./Settings";
import Schedule from "./Schedule";
// Utility imports
import AnilistUtil from "@utils/AniList";
import ArrayUtil from "@utils/Array";
import MiscUtil from "@utils/Misc";
import OsuUtil from "@utils/OsuGame";
import ProfaneUtil from "@utils/Profane";
import StringUtil from "@utils/String";
import TimeUtil from "@utils/Time";
import DBL from "@utils/DBL";

export default class AokiClient extends Client {
  constructor() {
    super({
      allowedMentions: { parse: ['users'] },
      presence: () => ({
        status: PresenceUpdateStatus.Idle,
        activities: [{
          name: "in development mode running Seyfert!",
          type: ActivityType.Watching,
        }],
        since: Date.now(),
        afk: false,
      })
    });
    this.dev = process.argv.includes('--dev');
    this.schedule = new Schedule(this);
    this.lastGuildCount = null;
    this.startTime = Date.now();
    this.dbClient = null;
    this.db = null;
    this.ready = false;
    this.osuV2Token = {
      access_token: null,
      expires_at: 0
    };
    this.settings = {
      users: new Settings("users"),
      guilds: new Settings("guilds"),
      schedules: new Settings("schedules"),
      verifications: new Settings("verifications")
    };
    this.utils = {
      anilist: new AnilistUtil(this),
      array: new ArrayUtil(),
      misc: new MiscUtil(),
      osu: new OsuUtil(),
      profane: new ProfaneUtil(),
      string: new StringUtil(),
      time: new TimeUtil(),
      dbl: new DBL(this)
    };
    this.statsCache = {
      data: {
        totalMem: 0,
        freeMem: 0,
        usedMem: 0,
        processMemUsage: 0,
        cpuLoad: 0,
        uptime: 0,
        clientVersion: "",
        clientUptime: "",
        commands: 0,
        servers: 0,
        users: 0,
        avgUsersPerServer: 0,
        description: "",
        embedTimestamp: new Date(),
      },
      lastUpdated: 0
    }
  }

  /**
   * Request an osu! API v2 token, then saves it.
   * Returns the token, or possibly nothing if there's an error.
   * @returns {Promise<string | null>}
   */
  public async requestV2Token(): Promise<string | null> {
    // Avoid spamming the osu api
    // If the token is still valid, return it
    if (this.osuV2Token && this.osuV2Token.expires_at || 0 > Date.now()) {
      return this.osuV2Token.access_token;
    }

    // Otherwise ask for it using our credentials
    const params = new URLSearchParams({
      client_id: this.dev ? process.env.OSU_DEV_ID! : process.env.OSU_ID!,
      client_secret: this.dev ? process.env.OSU_DEV_SECRET! : process.env.OSU_SECRET!,
      grant_type: 'client_credentials',
      scope: 'public'
    });

    const res = await fetch("https://osu.ppy.sh/oauth/token", {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const data = await res.json();

    // Then save it for later fetches until the end of the cycle
    this.osuV2Token = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000
    };

    return data.access_token;
  };

  /**
   * Load everything
   * @returns {Promise<void>}
   */
  private async init(): Promise<void> {
    await Promise.all([
      this.requestV2Token(),
      Object.values(this.settings).map(async settings => await settings.init())
    ]);
    // Load default locale
    this.setServices({ langs: { default: 'en-US' } });
    this.logger.info("Loaded baseline data");
  }

  /**
   * Log into client
   * @returns {Promise<string>}
   */
  public async login(): Promise<void> {
    await this.init();
    return super.start().then(() => super.uploadCommands({ cachePath: '../cmd.json' }));
  }
}
