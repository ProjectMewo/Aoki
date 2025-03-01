// settings and utils
// some of the functions in here are unreadable and hence are hard to debug
// when a refactor is necessary to debug things I'll do that
import AokiClient from "./Client";
import AniSchedule from "./Schedule";

export default class Utilities {
  public badWordsRegex?: RegExp;
  // never call client from this class
  // doing this.client.util.client is a dumb way to write code
  private client: AokiClient;
  public id: string;
  public logChannel: string;
  public owners: Array<string>;
  public mediaGenres: Array<string>;
  public mediaFormat: { [key: string]: string };
  public months: Array<string>;
  public weeks: Array<string>;
  public rankEmotes: { [key: string]: string };
  public langflags: Array<{ lang: string, flag: string }>;
  public formatDistanceIntervals: Array<{ label: string, ms: number }>;
  public timeMultipliers: { d: number, h: number, m: number, s: number };
  public alIdRegex: RegExp;
  public malIdRegex: RegExp;
  public encodeMap: { [key: string]: string };
  public decodeMap: { [key: string]: string };
  public namedEntityRegex: RegExp;
  public decodeRegex: RegExp;
  public constructor(client: AokiClient) {
    // client properties
    this.client = client;
    this.id = "704992714109878312";
    this.logChannel = "864096602952433665";
    this.owners = ["586913853804249090", "809674940994420736"];
    // utilities
    this.mediaGenres = ["Action", "Adventure", "Comedy", "Drama", "Sci-Fi", "Mystery", "Supernatural", "Fantasy", "Sports", "Romance", "Slice of Life", "Horror", "Psychological", "Thriller", "Ecchi", "Mecha", "Music", "Mahou Shoujo", "Hentai"];
    this.mediaFormat = { TV: "TV", TV_SHORT: "TV Shorts", MOVIE: "Movie", SPECIAL: "Special", ONA: "ONA", OVA: "OVA", MUSIC: "Music", MANGA: "Manga", NOVEL: "Light Novel", ONE_SHOT: "One Shot Manga" };
    this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.weeks = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    this.rankEmotes = {
      XH: "<:xh:1184870634124226620>", X: "<:x:1184870631372750871>",
      SH: "<:sh:1184870626394128518>", S: "<:s:1184870621109297162>",
      A: "<:a:1184870604843778170>", B: "<:b:1184870609470095442>",
      C: "<:c:1184870613421150258>", D: "<:d:1184870615572824154>",
      F: "<:f_:1184872548337451089>"
    };
    this.langflags = [
      { lang: "Hungarian", flag: "🇭🇺" }, { lang: "Japanese", flag: "🇯🇵" },
      { lang: "French", flag: "🇫🇷" }, { lang: "Russian", flag: "🇷🇺" },
      { lang: "German", flag: "🇩🇪" }, { lang: "English", flag: "🇺🇸" },
      { lang: "Italian", flag: "🇮🇹" }, { lang: "Spanish", flag: "🇪🇸" },
      { lang: "Korean", flag: "🇰🇷" }, { lang: "Chinese", flag: "🇨🇳" },
      { lang: "Brazilian", flag: "🇧🇷" }
    ];

    // try to pre-allocate commonly used objects for reuse
    // we avoid having to recreate these objects every time we need them
    this.formatDistanceIntervals = [
      { label: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { label: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
      { label: 'day', ms: 24 * 60 * 60 * 1000 },
      { label: 'hour', ms: 60 * 60 * 1000 },
      { label: 'minute', ms: 60 * 1000 },
      { label: 'second', ms: 1000 }
    ];
    this.timeMultipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
    this.alIdRegex = /anilist\.co\/anime\/(.\d*)/;
    this.malIdRegex = /myanimelist\.net\/anime\/(.\d*)/;
    this.encodeMap = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#x27', '`': '#x60' };
    this.decodeMap = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#x60': '`' };
    this.namedEntityRegex = /[&<>"'`]/g;
    this.decodeRegex = /&([^;\s]+);/g;

    this.fetchBadWordsRegex();
  }
  /**
   * Process an exception event (unhandledRejection or uncaughtException)
   * @param {string} event The event name
   * @param {Array} args Array with the error as the first element
   * @param {AokiClient} client The client, used to get the channel and warn if needed
   * @returns {void}
   */
  public processException(event: string, args: Array<any>, client: AokiClient): void {
    const channel = client.channels.cache.get("864096602952433665");
    const error = args[0];
  
    console.log(error);
    const stack = error.stack
      ?.split("\n")
      .slice(0, 5)
      .join("\n")
      .split(process.cwd())
      .join("MAIN_PROCESS") || "";
  
    const message = `\\🛠 ${error.name} caught!\n\`\`\`xl\n${stack}\n.....\n\`\`\``;
  
    if (channel && typeof (channel as any).send === 'function') return (channel as any).send(message);
    else return client.util.warn(`Channel not found for event '${event}'`, "[PROCESS]");
  };
  /**
   * Logs an errornous action to console.
   * @param {String} message The message to log
   * @param {String} title The title of the error message
   * @returns {void}
   */
  public error(message: string, title: string = "Error"): void {
    return console.log("\x1b[31m", title, "\x1b[0m", message);
  };
  /**
   * Escapes markdown characters from a string
   * @param {String} str The string to escape
   * @returns {String} The escaped string
   */
  public escapeMarkdown(str: string): string {
    return str.replace(/([*_~`])/g, "\\$1");
  }
  /**
   * Escapes special characters from a string
   * @param {String} str
   * @returns {String}
   */
  public escapeRegex(str: string): string {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  /**
   * Logs a successful action to console.
   * @param {String} message The message to log
   * @param {String} title The title of the success message
   * @returns {void}
   */
  public success(message: string, title: string = "Success"): void {
    return console.log("\x1b[32m", title, "\x1b[0m", message);
  };
  /**
   * Logs a warning to console.
   * @param {String} message The message to log
   * @param {String} title The title of the warning message
   * @returns {void}
   */
  public warn(message: string, title: string = "Warn"): void {
    return console.log("\x1b[33m", title, "\x1b[0m", message);
  };
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
  };
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
  };
  /**
   * Probability of outputting `true`.
   * Useful with fun commands
   * @param {Number} int Chance of `true`
   * @returns {Boolean}
   */
  public probability(int: number): boolean {
    const n = int / 100;
    return !!n && Math.random() <= n;
  };
  /**
   * Truncates a string.
   * Mostly used for trimming long descriptions from APIs
   * @param {String} str The string to truncate
   * @param {Number} length The desired output length
   * @param {String} end Sequence of characters to put at the end. Default `...`
   * @returns {String}
   */
  public textTruncate(str: string = '', length: number = 100, end: string = '...'): string {
    return String(str).substring(0, length - end.length) + (str.length > length ? end : '');
  };
  /**
   * Formats a number with commas as thousands separators and limits the number of decimal places.
   *
   * @param {Number|String} number - The number to format.
   * @param {Number} [maximumFractionDigits=2] - The maximum number of decimal places to display
   * @returns {String} The formatted number
   */
  public commatize(number: number | string, maximumFractionDigits: number = 2): string {
    return Number(number || "").toLocaleString("en-US", {
      maximumFractionDigits
    });
  };
  /**
   * Joins an array and limits the string output
   * @param {Array} array The array to join and limit
   * @param {Number} limit The limit to limit the string output
   * @param {String} connector Value connector like that of `array.join()`
   * @returns {String}
   */
  // this might be hard to read, but all in all it's just a reduce function
  public joinArrayAndLimit(array: Array<any> = [], limit: number = 1000, connector: string = '\n'): string {
    return array.reduce((a, c) => {
      const newLength = a.text.length + (a.text.length ? connector.length : 0) + String(c).length;
      return newLength > limit ? { text: a.text, excess: a.excess + 1 } : { text: a.text + (a.text.length ? connector : '') + String(c), excess: a.excess };
    }, { text: '', excess: 0 });
  };
  /**
   * Returns the ordinalized format of a number, e.g. `1st`, `2nd`, etc.
   * @param {Number} n Number to properly format
   * @returns {String}
   */
  public ordinalize(n: number = 0): string {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return n + 'st';
    if (j === 2 && k !== 12) return n + 'nd';
    if (j === 3 && k !== 13) return n + 'rd';
    return n + 'th';
  };
  /**
   * Properly uppercase a string
   * @param {String} str The string to format
   * @returns {String}
   */
  public toProperCase(str: string): string {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  };
  /**
   * Fetch AniList API data
   * @param {String} query GraphQL presentation of the query
   * @param {Object} variables Variables to throw into the graphql
   * @returns {Promise<object>}
   */
  public async anilist(query: string, variables: object): Promise<object> {
    return await fetch('https://graphql.anilist.co', {
      method: "POST",
      body: JSON.stringify({ query, variables }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }).then(async res => await res.json());
  };
  /**
   * Format numerical osu! mode to its string equivalent
   * @param {Number} int the number to convert to mode name
   * @returns {String}
   */
  public osuStringModeFormat(int: number): string {
    return ["osu", "taiko", "fruits", "mania"][int];
  };
  /**
   * Convert a `Date` to a human-readable date.
   * @param {Date} date A date object to format
   * @param {String} format Resulting format
   * @returns {String}
   */
  public formatDate(date: Date, format: string): string {
    const options: Intl.DateTimeFormatOptions = {};
    if (format.includes('MMMM')) options.month = 'long'; else if (format.includes('MMM')) options.month = 'short';
    if (format.includes('yyyy')) options.year = 'numeric';
    if (format.includes('dd')) options.day = '2-digit';
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  /**
   * Calculate the (approximated) time difference between 2 `Date`s
   * @param {Date} date1 The date being compared
   * @param {Date} date2 The date to compare against
   * @returns {String}
   */
  public formatDistance(date1: Date, date2: Date): string {
    const elapsed = Math.abs(date2.getTime() - date1.getTime());
    for (const interval of this.formatDistanceIntervals) {
      const count = Math.floor(elapsed / interval.ms);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };
  /**
   * Takes human-readable time input and outputs time in `ms` (e.g.: `5m 30s` -> `330000` | `3d 5h 2m` -> `277320000`)
   * @param {string} s - Time input (e.g.: `1m 20s`, `1s`, `3h 20m`)
   */
  public timeStringToMS(s: string): number {
    if (!s) throw new Error("Missing time string");
    const matches = s.match(/\d+\s?\w/g);
    if (!matches) return 0;
    return matches.reduce((t, v) => {
      // some casting stuff done at 4am no sleeper
      const key = v.trim().slice(-1) as keyof typeof this.timeMultipliers;
      return t + parseInt(v) * this.timeMultipliers[key];
    }, 0);
  };
  /**
   * Takes time in `ms` and outputs time in human-readable format
   * @param {Number} ms Time in milliseconds
   * @returns {String} `(x)d(y)h(z)m(t)s` e.g. `1d3h4m2s`
   */
  public msToTimeString(ms: number): string {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${d ? d + "d" : ""}${d ? " " : ""}${h ? h + "h" : ""}${h ? " " : ""}${m ? m + "m" : ""}${m ? " " : ""}${s ? s + "s" : ""}`;
  };
  /**
   * Pseudo-randomly pick an entry from the given array
   * @param {Array} arr The array to randomly pick from
   * @returns `arr[entry]` An item from the array
   */
  public random(arr: Array<any>) {
    const pick = Math.floor(Math.random() * arr.length);
    return arr[pick] || arr[0];
  };
  /**
   * Generates a proper embed field value for key-value objects
   * @param {Object} obj The object with key-value pairs
   * @param {Number} cwidth The width between key and value
   * @returns {String}
   */
  // this might be hard to read
  // to understand what this is doing, use it
  public keyValueField(obj: object, cwidth: number = 24): string {
    return '```fix\n' + Object.entries(obj).map(([key, value]) => {
      const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
      const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));
      return '• ' + name + ':' + spacing + value;
    }).join('\n') + '```'
  };
  /**
   * Format string osu! mode to its numerical value
   * @param {String} str Mode string to convert
   * @returns {Number}
   */
  public osuNumberModeFormat(str: string): number {
    if (str == "osu") return 0;
    if (str == "taiko") return 1;
    if (str == "fruits") return 2;
    if (str == "mania") return 3;
    else return Number(str);
  };
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
  /**
   * Fetches static JSON asset stored on `npoint.io`.
   * @param {String} name Asset name
   * @returns {Promise<object>}
   */
  public async getStatic(name: string): Promise<object> {
    // simplify by adding everything into one file
    const id = "15038d9b7330785beca0";
    const res = await fetch(`https://api.npoint.io/${id}`).then(async res => await res.json());
    return res[name];
  };
  /**
   * Uploads an image to `imgbb`
   * @param {String} base64 The `base64` string of the Buffer
   * @returns {Promise<string | null>} The direct URL to the image
   */
  public async upload(base64: string): Promise<string | null> {
    const form = new FormData();
    form.append("image", base64);
    const res = await fetch([
      `https://api.imgbb.com/1/upload?`,
      `expiration=${this.timeStringToMS("30m") / 1000}&`,
      `key=${process.env.UPLOAD_KEY}`
    ].join(""), {
      method: "POST",
      body: form
    }).then(async res => await res.json());
    return res.data?.url || null;
  };
  /**
   * Encodes a string to its corresponding HTML entities
   * @param {string} string - The string to be HTML encoded
   * @returns {string} The HTML encoded string
   */
  public heEncode(string: string): string {
    return string.replace(this.namedEntityRegex, char => {
      return `&${this.encodeMap[char]};`;
    });
  };
  /**
   * Decodes an HTML string by converting HTML entities back to their original characters
   * @param {string} html - The HTML encoded string to decode
   * @returns {string} The decoded string with HTML entities converted back
   */
  public heDecode(html: string): string {
    return html.replace(this.decodeRegex, (_, entity) => {
      return this.decodeMap[entity] || _;
    });
  };
  /**
   * Escape a string by converting special characters to their HTML entities
   *
   * This is a convenience alias for the `heEncode` function. It ensures that a string is safe
   * for use in HTML contexts by converting specific characters into their HTML entity forms
   *
   * @param {string} string - The string to escape
   * @returns {string} The escaped string
   */
  public heEscape(string: string): string {
    return this.heEncode(string);
  };
}
