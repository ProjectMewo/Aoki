class Event {
  public name: string;
  public once: Boolean;
  constructor(name: string, once: Boolean = false) {
    this.name = name;
    this.once = once;
  }
  /**
   * Execute the event
   */
  // @ts-ignore
  public async execute(...args: any[]) {
    throw new Error('Execute method not implemented');
  }
}

export default Event;
