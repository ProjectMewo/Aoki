/**
 * Base class for all events.
 * To create a new event, extend this class and implement
 * the execute method.
 * 
 * In the event file, export a new instance of the extended class.
 */
class Event {
  /**
   * The name of the event to listen for
   * @type {string}
   */
  public name: string;

  /**
   * Whether the event should only be triggered once
   * @type {boolean}
   */
  public once: boolean;

  /**
   * Create a new event.
   * @param {string} options.name - The name of the event
   * @param {boolean} options.once - Whether the event should only be triggered once
   */
  constructor(options: {
    name: string, 
    once: boolean
  }) {
    this.name = options.name;
    this.once = options.once ?? false;
  }

  /**
   * Execute the event.
   * We expect this method to be implemented in the
   * event files.
   */
  // @ts-ignore
  public async execute(...args): Promise<void> {
    throw new Error('Execute method not implemented');
  }
}

export default Event;
