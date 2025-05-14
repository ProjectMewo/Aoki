/**
 * Utility class for array manipulation and operations
 */
export default class ArrayUtil {
  /**
   * Removes duplicates from an array
   * @param {Array} array The array to remove duplicates from
   * @returns {Array}
   */
  public removeDuplicates<T>(array: Array<T>): Array<T> {
    return [...new Set(array)];
  }

  /**
   * Flattens an array
   * @param {Array} array The array to flatten
   * @returns {Array}
   */
  public flatten<T>(array: Array<T[]>): Array<T> {
    return array.reduce((a, b) => a.concat(b), [] as T[]);
  }

  /**
   * Shuffles an array
   * @param {Array} array The array to shuffle
   * @returns {Array}
   */
  public shuffle<T>(array: Array<T>): Array<T> {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Pseudo-randomly pick an entry from the given array
   * @param {Array} arr The array to randomly pick from
   * @returns `arr[entry]` An item from the array
   */
  public random<T>(arr: Array<T>): T {
    const pick = Math.floor(Math.random() * arr.length);
    return arr[pick] || arr[0];
  }

  /**
   * Probability of outputting `true`.
   * Useful with fun commands
   * @param {Number} int Chance of `true`
   * @returns {Boolean}
   */
  public probability(int: number): boolean {
    const n = int / 100;
    return !!n && Math.random() <= n;
  }
}