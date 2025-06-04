import { UsingClient } from "seyfert";

/**
 * Utility class for osu!-specific operations
 */
export default class OsuUtil {
  public rankEmotes: { [key: string]: string };

  constructor() {
    this.rankEmotes = {
      XH: "<:xh:1184870634124226620>", X: "<:x:1184870631372750871>",
      SH: "<:sh:1184870626394128518>", S: "<:s:1184870621109297162>",
      A: "<:a:1184870604843778170>", B: "<:b:1184870609470095442>",
      C: "<:c:1184870613421150258>", D: "<:d:1184870615572824154>",
      F: "<:f_:1184872548337451089>"
    };
  }

  /**
   * Format numerical osu! mode to its string equivalent
   * @param {Number} int The number to convert to mode name
   * @returns {String}
   */
  public stringModeFormat(int: number): string {
    return ["osu", "taiko", "fruits", "mania"][int];
  }

  /**
   * Format string osu! mode to its numerical equivalent
   * @param {String} str Mode string to convert
   * @returns {Number}
   */
  public numberModeFormat(str: string): number {
    if (str == "osu") return 0;
    if (str == "taiko") return 1;
    if (str == "fruits") return 2;
    if (str == "mania") return 3;
    else return Number(str);
  }

  /**
   * Extract difficulty ID from a beatmap URL
   * @param url The beatmap URL to extract ID from
   * @returns {string}
   */
  public extractDifficultyId(url: string): string {
    if (url.includes('/b/')) {
      return url.split('/b/')[1].split('?')[0].split('#')[0];
    } else {
      return url.split('#')[1].split('/')[1];
    }
  };

  /**
   * Fetch a beatmap's information
   * @param client The current instance of the client
   * @param diffId The difficulty ID of the map
   * @returns API response
   */
  public async fetchBeatmapInfo(client: UsingClient, diffId: string) {
    try {
      const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${diffId}`, {
        headers: {
          Authorization: `Bearer ${await client.requestV2Token()}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch beatmap ${diffId}:`, error);
      return null;
    }
  };
}