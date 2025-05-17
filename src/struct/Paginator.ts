import {
  Embed,
  Message,
  ComponentInteraction,
  ActionRow,
  Button,
  ChatInputCommandInteraction,
  ButtonInteraction,
  Interaction,
  WebhookMessage
} from 'seyfert';
import {
  ButtonStyle
} from 'seyfert/lib/types';

/**
 * Creates a pagination instance for multiple "pages" of content
 * 
 * Use classic collector to handle navigation  
 */
export default class Pagination {
  private _array: Array<Embed>;
  private _index: number;
  private _collector: any;
  private _message: Message | Interaction | WebhookMessage | null;

  constructor(...arr: Embed[]) {
    /**
     * Array of Embed to paginate
     * @type {Embed[]}
     * @private
     */
    this._array = [...arr].flat();

    /**
     * The index of this paginate instance
     * @type {Number}
     * @private
     */
    this._index = 0;

    /**
     * The active collector
     * @type {ReactionCollector | InteractionCollector}
     * @private
     */
    this._collector = null;

    /**
     * The message being paginated
     * @type {Message | Interaction | null}
     * @private
     */
    this._message = null;

    /**
     * Validate array content
     * @type {function}
     */
    this._validate();
  }

  /**
   * Handles pagination with automatic collector setup
   * @param {Object} options Options for handling pagination
   * @param {ChatInputCommandInteraction | Message} options.sender The interaction or message that initiated pagination
   * @param {string} [options.filter='userOnly'] Filter type for the collector ('userOnly', 'everyone')
   * @param {ActionRow[]} [options.components] Custom components to use instead of default buttons
   * @param {number} [options.time=60000] Time in ms before collector expires
   * @param {Object} [options.emojis] Custom emojis for navigation buttons
   * @returns {Promise<Message|InteractionResponse>} The message with the pagination
   */
  public async handle(options: {
    sender: ChatInputCommandInteraction | Message,
    filter?: 'userOnly' | 'everyone',
    components?: ActionRow<Button>[],
    time?: number,
    emojis?: { prev?: string, next?: string, stop?: string }
  }): Promise<Message | Interaction | WebhookMessage> {
    if (!this._array.length) throw new Error('No pages to paginate');

    const {
      sender,
      filter = 'userOnly',
      time = 60000,
      emojis = { prev: '◀️', next: '▶️', stop: '⏹️' }
    } = options;

    const userId = sender.user.id;

    // Create default components if none provided
    const row = options.components?.[0] || new ActionRow<Button>()
      .addComponents(
        new Button()
          .setCustomId('pagination_prev')
          .setEmoji(emojis.prev!)
          .setStyle(ButtonStyle.Secondary),
        new Button()
          .setCustomId('pagination_stop')
          .setEmoji(emojis.stop!)
          .setStyle(ButtonStyle.Danger),
        new Button()
          .setCustomId('pagination_next')
          .setEmoji(emojis.next!)
          .setStyle(ButtonStyle.Secondary),
      );

    const components = options.components || [row];

    let message: Message | Interaction | WebhookMessage;

    // Prepare common message options
    const messageOptions = {
      embeds: [this.currentPage],
      components: this.size <= 1 ? [] : components,
    };

    // We distinguish an interaction from a message by
    // checking if there is a content property in the sender.
    // Only Message has the content property.
    if ('content' in sender) {
      // Message based
      message = await (sender as Message).reply(messageOptions);
    } else {
      // Interaction based
      const interaction = sender as ChatInputCommandInteraction;
      if (interaction.replied) {
        message = await interaction.editOrReply(messageOptions, true);
      } else {
        message = await interaction.write(messageOptions, true);
      }
    }

    this._message = message;

    // Skip collector if only one page
    if (this.size <= 1) return message;
    // If there's no message throw an error, something is wrong
    if (!message) throw new Error('No message to paginate');

    // Set up filter based on option
    const userFilter = (interaction: ComponentInteraction<true>) => {
      if (filter === 'userOnly') {
        return interaction.user.id == userId;
      }
      return true;
    };

    this._collector = this._message.createComponentCollector({
      filter: userFilter,
      timeout: time
    });

    // Handle collector events
    this._collector.on('collect', async (interaction: ButtonInteraction) => {
      try {
        await interaction.deferUpdate();

        switch (interaction.customId) {
          case 'pagination_prev':
            this.previous();
            break;
          case 'pagination_next':
            this.next();
            break;
          case 'pagination_stop':
            this._collector.stop();
            break;
          default:
            // Handle custom buttons if needed
            if (interaction.customId.startsWith('pagination_custom_')) {
              // Add any custom button handling logic here if needed
            }
            break;
        }

        if (['pagination_prev', 'pagination_next'].includes(interaction.customId)) {
          if ('edit' in this._message!) {
            await this._message!.edit({
              embeds: [this.currentPage],
              components: components
            });
          } else if ('editReply' in this._message!) {
            await this._message!.editOrReply({
              embeds: [this.currentPage],
              components: components
            });
          }
        }
      } catch (error) {
        console.error('Error handling pagination interaction:', error);
      }
    });

    // Remove components when collector ends
    this._collector.on('end', async () => {
      try {
        if ('edit' in this._message!) {
          await this._message!.edit({
            embeds: [this.currentPage],
            components: []
          });
        } else if ('editReply' in this._message!) {
          await this._message!.editOrReply({
            embeds: [this.currentPage],
            components: []
          });
        }
      } catch (error) {
        console.error('Error ending pagination:', error);
      }
    });

    return message;
  }

  /**
   * Stops the active collector if any
   */
  public stop(): void {
    if (this._collector) {
      this._collector.stop();
      this._collector = null;
    }
  }

  /**
   * Add more Embeds to the array
   * @param {Embed[]} i An array or a single Embed instance
   * @returns {Embed[]} The array of the added Embeds
  */
  public add(...i: Embed[]): Embed[] {
    this._array.push(...i.flat());
    this._validate()
    return [...i.flat()];
  };

  /**
   * Delete elements from the array
   * @param {number} index the index of the element to remove
   * @returns {Embed[]} The array of the deleted Embed
  */
  public delete(index: number): Embed[] {
    if (typeof index !== 'number') return [];
    else {
      if (index === this.currentIndex) if (this.currentIndex > 0) this.previous();
      else if (this.currentIndex === this.tail) this.previous();
      return this._array.splice(index, 1);
    };
  };

  /**
   * Moves the index up to view the next element from the array
   * This will also reset to 0 if the index exceeds array length
   * @returns {Embed | undefined} The element from the array
  */
  public next(): Embed | undefined {
    if (!this._array.length) return undefined;
    if (this._index === this.tail) this._index = -1;
    this._index++;
    return this._array[this._index];
  };

  /**
   * Moves the index down to view the previous element from the array
   * This will also reset to max index if the index < 0
   * @returns {Embed | undefined} The element from the array
  */
  public previous(): Embed | undefined {
    if (!this._array.length) return undefined;
    if (!this.tail) return undefined;
    if (this._index === 0) this._index = this.tail + 1;
    this._index--;
    return this._array[this._index];
  };

  /**
   * The current embed using the current index
   * @type {Embed}
   * @readonly
  */
  public get currentPage() {
    return this._array[this._index];
  };

  /**
   * The first embed from the array
   * @type {Embed}
   * @readonly
  */
  public get firstPage() {
    return this._array[0];
  };

  /**
   * The last embed from the array
   * @type {Embed}
   * @readonly
  */
  public get lastPage() {
    if (!this.tail) return null;
    return this._array[this.tail];
  };

  /**
   * The current index
   * @type {Number}
   * @readonly
  */
  public get currentIndex() {
    return this._index;
  };

  /**
   * The number of embed in the array
   * @type {Number}
   * @readonly
  */
  public get size() {
    return this._array.length;
  };

  /**
   * The last index, or null if no element.
   * @type {Number}
   * @readonly
  */
  public get tail() {
    return this._array.length > 0 ? this._array.length - 1 : null;
  };

  /**
   * Checks if there is a non message embed present in the array
   * @returns {void}
  */
  private _validate(): void {
    for (const el of this._array) {
      if (!(el instanceof Embed)) {
        throw new Error('Passed argument is not an instance of Embed.');
      };
    };
    return;
  };
};