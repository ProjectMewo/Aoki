/**
 * Utility class for content moderation and filtering
 */
export default class ProfaneUtil {
  private badWordsRegex?: RegExp;
  
  constructor() {
    this.fetchBadWordsRegex();
  }

  /**
   * Fetches and initializes the bad words regex from npoint
   * If the fetch fails, it falls back to a simple default regex
   * @returns {Promise<void>}
   */
  public async fetchBadWordsRegex(): Promise<void> {
    try {
      const data: { regex: string } = await this.getStatic("profane", "en-US") as { regex: string };
      this.badWordsRegex = new RegExp(data.regex, 'gi');
    } catch (error) {
      console.error('Error fetching bad words regex:', error);
      // fallback
      this.badWordsRegex = /\b(fuck|shit|ass|bitch|cunt|dick|pussy|cock|whore|slut|bastard)\b/gi;
    }
  }

  /**
   * Search for profane words in a string.
   * This function is mainly to comply with top.gg's policies
   * @param {String} str String to search for profane words
   * @returns {Boolean}
   */
  public async isProfane(str: string): Promise<boolean> {
    if (!this.badWordsRegex) {
      await this.fetchBadWordsRegex();
    }
    return this.badWordsRegex!.test(str);
  }

  /**
   * Replace profane words with # characters
   * @param {String} str The string to search for
   * @returns {String}
   */
  public async cleanProfane(str: string): Promise<string> {
    if (!this.badWordsRegex) {
      await this.fetchBadWordsRegex();
    }
    return str.replace(this.badWordsRegex!, () => "####");
  }

  /**
   * Fetches static JSON asset stored on `npoint.io`.
   * @param {String} name Asset name
   * @returns {Promise<any>}
   */
  public async getStatic<T>(name: T, locale: "en-US" | "vi"): Promise<any> {
    const en = {
      fortune: "85fdb16380ad58504f7a",
      "8ball": "154e45574255a4137fd3",
      common: "ee649529698919c7067d",
      truth: "8a1cba8911598f4a7644",
      profane: "a8a151087e4973dd4fc4"
    };
    const vi = {
      fortune: "e7568e6e060bbb2aaaa1",
      "8ball": "e8daec87a72f3d4a1243",
      common: "624a35c28d2d171fdec0",
      truth: "53455897a015a6d33463",
      profane: "a8a151087e4973dd4fc4"
    };
    const res = await fetch([
      `https://api.npoint.io/`,
      `${locale == 'en-US' ? en[name as keyof typeof en] : vi[name as keyof typeof vi]}`
    ].join("")).then(async res => await res.json());
    return res;
  }
}