interface StaticData {
  nsfw: {
    domains: string[];
  };
  ping: string[];
  "8ball": string[];
  truth: string[];
  fortune: string[];
  profane: {
    regex: string;
  };
}

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
      const data: { regex: string } = await this.getStatic("profane") as { regex: string };
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
   * @returns {Promise<StaticData[T]>}
   */
  public async getStatic<T extends keyof StaticData>(name: T): Promise<StaticData[T]> {
    const id = "15038d9b7330785beca0";
    const res: StaticData = await fetch(`https://api.npoint.io/${id}`).then(async res => res.json());
    return res[name];
  }
}