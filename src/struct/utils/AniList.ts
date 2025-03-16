import AniSchedule from "../Schedule";
import AokiClient from "../Client";

/**
 * Utility class for AniList and anime-related operations
 */
export default class AnilistUtil {
  public mediaGenres: Array<string>;
  public mediaFormat: { [key: string]: string };
  public langflags: Array<{ lang: string, flag: string }>;
  public months: Array<string>;
  public weeks: Array<string>;
  private alIdRegex: RegExp;
  private malIdRegex: RegExp;
  private client: AokiClient;
  
  constructor(client: AokiClient) {
    this.client = client;
    this.months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    this.weeks = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    this.mediaGenres = [
      "Action", "Adventure", "Comedy", "Drama", "Sci-Fi", "Mystery", 
      "Supernatural", "Fantasy", "Sports", "Romance", "Slice of Life", 
      "Horror", "Psychological", "Thriller", "Ecchi", "Mecha", 
      "Music", "Mahou Shoujo", "Hentai"
    ];
    this.langflags = [
      { lang: "Hungarian", flag: "🇭🇺" }, { lang: "Japanese", flag: "🇯🇵" },
      { lang: "French", flag: "🇫🇷" }, { lang: "Russian", flag: "🇷🇺" },
      { lang: "German", flag: "🇩🇪" }, { lang: "English", flag: "🇺🇸" },
      { lang: "Italian", flag: "🇮🇹" }, { lang: "Spanish", flag: "🇪🇸" },
      { lang: "Korean", flag: "🇰🇷" }, { lang: "Chinese", flag: "🇨🇳" },
      { lang: "Brazilian", flag: "🇧🇷" }
    ];
    this.mediaFormat = { 
      TV: "TV", 
      TV_SHORT: "TV Shorts", 
      MOVIE: "Movie", 
      SPECIAL: "Special", 
      ONA: "ONA", 
      OVA: "OVA", 
      MUSIC: "Music", 
      MANGA: "Manga", 
      NOVEL: "Light Novel", 
      ONE_SHOT: "One Shot Manga" 
    };
    this.alIdRegex = /anilist\.co\/anime\/(.\d*)/;
    this.malIdRegex = /myanimelist\.net\/anime\/(.\d*)/;
  }

  /**
   * Fetch AniList API data
   * @param {String} query GraphQL presentation of the query
   * @param {Object} variables Variables to throw into the graphql
   * @returns {Promise<any>}
   */
  public async fetch(query: string, variables: object): Promise<any> {
    return await fetch('https://graphql.anilist.co', {
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }).then(async res => (await res.json()).data);
  }

  /**
   * Get AniList ID equivalent for MAL, or parse an AniList URL to ID
   * @param {String} input The string to be parsed
   * @returns {Promise<number | null>} The AniList equivalent of the provided media
   */
  public async getMediaId(input: string): Promise<number | null> {
    // if the input is already an id
    const output = parseInt(input);
    if (output) return output;
    // else check url against the regex
    let match = this.alIdRegex.exec(input);
    if (match) return parseInt(match[1]);
    // else try parsing with mal
    match = this.malIdRegex.exec(input);
    // if it still fail that means the provided input is invalid
    if (!match) return null;
    // else fetch anilist equivalent
    const ani = new AniSchedule(this.client);
    const res = await ani.fetch<{ data: { Media: { id: number } } }>("query($malId: Int) { Media(idMal: $malId) { id } }", { malId: match[1] });
    return res.data.Media.id;
  }

  /**
   * Convert raw title key to proper title from AniList media object
   * @param {Object} title The title object from fetched media
   * @param {String} wanted The wanted format of the title
   * @returns {String} The proper title
   */
  public getTitle(title: { native?: string; romaji?: string; english?: string }, wanted: string): string {
    switch (wanted) {
      case "NATIVE": return title.native || "";
      case "ROMAJI": return title.romaji || "";
      case "ENGLISH": return title.english || title.romaji || "";
      default: return title.romaji || "";
    }
  }
}