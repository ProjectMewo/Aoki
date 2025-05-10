import { Client, Logger } from "seyfert";
import { MongoClient, Db } from 'mongodb'
import Settings from "@struct/Settings";
import AniSchedule from "@struct/Schedule";
// Utils
import AnilistUtil from "@utils/AniList";
import ArrayUtil from "@utils/Array";
import MiscUtil from "@utils/Misc";
import OsuUtil from "@utils/OsuGame";
import ProfaneUtil from "@utils/Profane";
import StringUtil from "@utils/String";
import TimeUtil from "@utils/Time";
import DBL from "@utils/DBL";

declare module '@struct/Client' {
  export default interface AokiClient extends Client {
    /**
     * Whether the client is in dev mode or not
     * @type {boolean}
     */
    dev: boolean;
    /**
     * The scheduler instance of this client
     * @type {AniSchedule}
     */
    schedule: AniSchedule;
    /**
     * The last guild count of this client
     * @type {number}
     */
    lastGuildCount: number | null;
    /**
     * The time this client was started
     * @type {number}
     */
    startTime: number;
    /**
     * The MongoDB client instance of this client
     * @type {MongoClient | null}
     * @private
     */
    dbClient: MongoClient | null;
    /**
     * The Mongo database instance of this client
     * @type {Db | null}
     */
    db: Db | null;
    /**
     * The osu! v2 token of this client instance
     * @type {object}
     */
    osuV2Token: {
      access_token: string | null;
      expires_at: number;
    };
    /**
     * The settings collection of this client
     * @type {Object}
     */
    settings: {
      users: Settings;
      guilds: Settings;
      schedules: Settings;
      verifications: Settings;
    };
    /**
     * Utility functions for this client
     */
    utils: {
      anilist: AnilistUtil;
      array: ArrayUtil;
      osu: OsuUtil;
      profane: ProfaneUtil;
      string: StringUtil;
      time: TimeUtil;
      misc: MiscUtil;
      dbl: DBL;
    };
    /**
     * The ready status of this client
     * @type {boolean}
     */
    ready: boolean;
  }
}