/**
 * Utility class for time and date operations
 */
export default class TimeUtil {
  public formatDistanceIntervals: Array<{ label: string, ms: number }>;
  public timeMultipliers: { d: number, h: number, m: number, s: number };

  constructor() {
    // Pre-allocate commonly used objects for reuse
    this.formatDistanceIntervals = [
      { label: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
      { label: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
      { label: 'day', ms: 24 * 60 * 60 * 1000 },
      { label: 'hour', ms: 60 * 60 * 1000 },
      { label: 'minute', ms: 60 * 1000 },
      { label: 'second', ms: 1000 }
    ];
    this.timeMultipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  }

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
  }

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
  }

  /**
   * Takes human-readable time input and outputs time in `ms` (e.g.: `5m 30s` -> `330000` | `3d 5h 2m` -> `277320000`)
   * @param {string} s - Time input (e.g.: `1m 20s`, `1s`, `3h 20m`)
   */
  public timeStringToMS(s: string): number {
    if (!s) throw new Error("Missing time string");
    const matches = s.match(/\d+\s?\w/g);
    if (!matches) return 0;
    return matches.reduce((t, v) => {
      const key = v.trim().slice(-1) as keyof typeof this.timeMultipliers;
      return t + parseInt(v) * this.timeMultipliers[key];
    }, 0);
  }

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
  }
}