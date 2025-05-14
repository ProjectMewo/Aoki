import levenshtein from 'fast-levenshtein';

/**
 * Utility class for text and string manipulation
 */
export default class TextUtil {
  private namedEntityRegex: RegExp;
  private decodeRegex: RegExp;
  private encodeMap: { [key: string]: string };
  private decodeMap: { [key: string]: string };

  constructor() {
    this.encodeMap = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#x27', '`': '#x60' };
    this.decodeMap = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#x60': '`' };
    this.namedEntityRegex = /[&<>"'`]/g;
    this.decodeRegex = /&([^;\s]+);/g;
  }

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
   * Truncates a string.
   * Mostly used for trimming long descriptions from APIs
   * @param {String} str The string to truncate
   * @param {Number} length The desired output length
   * @param {String} end Sequence of characters to put at the end. Default `...`
   * @returns {String}
   */
  public textTruncate(str: string = '', length: number = 100, end: string = '...'): string {
    return String(str).substring(0, length - end.length) + (str.length > length ? end : '');
  }

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
  }

  /**
   * Joins an array and limits the string output
   * @param {Array} array The array to join and limit
   * @param {Number} limit The limit to limit the string output
   * @param {String} connector Value connector like that of `array.join()`
   * @returns {Object}
   */
  public joinArrayAndLimit(array: Array<any> = [], limit: number = 1000, connector: string = '\n'): { text: string, excess: number } {
    return array.reduce((a, c) => {
      const newLength = a.text.length + (a.text.length ? connector.length : 0) + String(c).length;
      return newLength > limit ? { text: a.text, excess: a.excess + 1 } : { text: a.text + (a.text.length ? connector : '') + String(c), excess: a.excess };
    }, { text: '', excess: 0 });
  }

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
  }

  /**
   * Properly uppercase a string
   * @param {String} str The string to format
   * @returns {String}
   */
  public toProperCase(str: string): string {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  /**
   * Find the known entry that matches the input string the closest.
   * @param input The input string
   * @param titles The known entries to match against
   * @param threshold The threshold to match
   * @returns {String | null}
   */
  public findClosestTitle(input: string, titles: string[], threshold = 75): string | null {
    input = input.toLowerCase();
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const title of titles) {
      const distance = levenshtein.get(input, title.toLowerCase());
      if (distance < bestDistance && distance <= threshold) {
        bestDistance = distance;
        bestMatch = title;
      }
    }

    return bestMatch;
  }

  /**
   * Check if a string contains a sequence of words that match one or more entries in a known array
   * @param filename The name of the string to match
   * @param knownTitles The known array of words to match
   * @returns {Array<string>}
   */
  public findAllMatchingTitles(filename: string, knownTitles: string[]): string[] {
    const cleaned = filename
      .replace(/[_\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const words = cleaned.split(" ");
    const matches: string[] = [];

    for (const title of knownTitles) {
      const titleWords = title.toLowerCase().split(" ");
      for (let i = 0; i <= words.length - titleWords.length; i++) {
        const slice = words.slice(i, i + titleWords.length);
        if (slice.join(" ") === titleWords.join(" ")) {
          matches.push(title);
          break;
        }
      }
    }

    return matches;
  }

  /**
   * Generates a proper embed field value for key-value objects
   * @param {Object} obj The object with key-value pairs
   * @param {Number} cwidth The width between key and value
   * @returns {String}
   */
  public keyValueField(obj: object, cwidth: number = 24): string {
    return '```fix\n' + Object.entries(obj).map(([key, value]) => {
      const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
      const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));
      return '• ' + name + ':' + spacing + value;
    }).join('\n') + '```';
  }

  /**
   * Encodes a string to its corresponding HTML entities
   * @param {string} string - The string to be HTML encoded
   * @returns {string} The HTML encoded string
   */
  public heEncode(string: string): string {
    return string.replace(this.namedEntityRegex, char => {
      return `&${this.encodeMap[char as keyof typeof this.encodeMap]};`;
    });
  }

  /**
   * Decodes an HTML string by converting HTML entities back to their original characters
   * @param {string} html - The HTML encoded string to decode
   * @returns {string} The decoded string with HTML entities converted back
   */
  public heDecode(html: string): string {
    return html.replace(this.decodeRegex, (_, entity) => {
      return this.decodeMap[entity as keyof typeof this.decodeMap] || _;
    });
  }

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
  }
}