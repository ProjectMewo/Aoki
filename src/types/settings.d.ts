/**
 * The possible values for the current round of the tournament.
 */
export type TournamentRound = "" | "Qualifiers" | "Group Stage" | "Round of 32" | "Round of 16" | "Quarterfinals" | "Semifinals" | "Finals" | "Grand Finals";

/**
 * @interface GuildSettings
 * Represents the configuration settings for a guild.
 */
export interface GuildSettings {
  /**
   * The ID of the channels where timestamps are sent.
   */
  timestampChannel: Array<string>,
  /**
   * The verification settings for the guild.
   */
  verification: Partial<{
    /**
     * The ID of the role assigned to users upon verification.
     */
    roleId: string,
    /**
     * Indicates whether the verification system is enabled.
     */
    status: boolean,
    /**
     * The ID of the channel where verification takes place.
     */
    channelId: string,
    /**
     * The ID of the message used for verification.
     */
    messageId: string,
    /**
     * The title text displayed in the verification message.
     */
    title: string,
    /**
     * The description text displayed in the verification message.
     */
    description: string,
    /**
     * The URL of the thumbnail image displayed in the verification message.
     */
    thumbnail: string,
    /**
     * The color of the verification message embed, typically in hexadecimal format.
     */
    color: string
  }>,
  /**
   * The (osu!) tournament settings for this guild
   */
  tournament: {
    /**
     * The name of the tournament
     */
    name: string,
    /**
     * The abbreviation of the tournament
     */
    abbreviation: string,
    /**
     * The current round of the tournament
     */
    currentRound: TournamentRound,
    /**
     * The available mappools of the tournament
     */
    mappools: Array<Mappool>,
    /**
     * The role IDs of a basic tournament setting
     * Assign role IDs to this as an array
     */
    roles: {
      /**
       * The role IDs of host of this tournament
       */
      host: Array<string>,
      /**
       * The role IDs of advisor of this tournament
       */
      advisor: Array<string>,
      /**
       * The role IDs of mappooler of this tournament
       */
      mappooler: Array<string>,
      /**
       * The role IDs of custom mapper of this tournament
       */
      customMapper: Array<string>,
      /**
       * The role IDs of test/replayers of this tournament
       */
      testReplayer: Array<string>
    }
  }
  
}

/**
 * @interface UserSettings
 * Represents the configuration settings for a user.
 */
export interface UserSettings {
  /**
   * The user's osu! in-game username.
   */
  inGameName: string,
  /**
   * The user's osu! default gamemode.
   */
  defaultMode: number,
  /**
   * Indicates whether we can process this user's messages.
   */
  processMessagePermission: boolean,
  /**
   * Indicates whether we can save this user's osu! account details on verification success.
   */
  saveOsuUserAccount: boolean
};

/**
 * @interface ScheduleData
 * Represents the schedule data for a user.
 */
export interface ScheduleData {
  /**
   * The AniList ID of this schedule.
   */
  anilistId: number;
  /**
   * The next episode we're tracking.
   */
  nextEp: number;
}

export interface VerificationSettings {
  id: string,
  state: string,
  createdAt: string,
  guildId: string
}

/**
 * @interface Suggestion
 * Represents a suggestion for a mappool.
 */
export interface Suggestion {
  slot: string;
  urls: Array<string>;
}

/**
 * @interface Replay
 * Represents a replay for a slot.
 */
export interface Replay {
  replayer: string;
  slot: string;
  messageUrl: string;
}

/**
 * @interface Mappool
 * Represents a mappool for a tournament.
 */
export interface Mappool {
  round: TournamentRound;
  slots: Array<string>;
  maps: Array<{
    slot: string;
    url: string;
    fullRecognizer: string;
  }>;
  replays: Array<Replay>;
  suggestions: Array<Suggestion>;
  /**
   * The ID of the channel where replays for this round are sent.
   */
  replayChannelId?: string;
}
