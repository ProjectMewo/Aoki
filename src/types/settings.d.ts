/**
 * @interface GuildSettings
 * Represents the configuration settings for a guild.
 */
export interface GuildSettings {
  /**
   * The ID of the channel where timestamps are sent.
   */
  timestampChannel: string,
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
  }>
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
  processMessagePermission: boolean
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