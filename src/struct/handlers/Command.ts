import { 
  AutocompleteInteraction,
  ChatInputCommandInteraction, 
  EmbedBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import AokiClient from '../Client';

class Command {
  public data: SlashCommandSubcommandsOnlyBuilder;
  public permissions: Array<bigint>;
  public cooldown: number;
  private cooldowns: Map<string, number>;

  public constructor(options: { data: SlashCommandSubcommandsOnlyBuilder; permissions?: Array<bigint>; cooldown?: number }) {
    this.data = options.data;
    this.permissions = options.permissions || [];
    this.cooldown = options.cooldown || 0;
    this.cooldowns = new Map<string, number>();
  }
  /**
   * Check if given user has all specified guild permissions
   * @param {Object} i Interaction object
   * @returns `Boolean` Whether the provided user has the required guild permissions
   */
  public hasPermissions(i: ChatInputCommandInteraction) {
    if (!this.permissions.length) return true;

    const member = i.guild?.members.cache.get(i.user.id);
    return this.permissions.every((permission) => member?.permissions.has(permission));
  }
  /**
   * Check if given user is on cooldown for this command
   * @param {string} userId The user ID to check
   * @returns `Boolean` Whether the user is on cooldown
   */
  public isOnCooldown(userId: string): boolean {
    const lastUsed = this.cooldowns.get(userId);
    if (lastUsed === undefined) return false;
    const expirationTime = lastUsed + this.cooldown * 1000;
    return Date.now() < expirationTime;
  }
  /**
   * Get the duration remaining for the user to be able to execute this command again
   * @param {string} userId The user ID to check
   * @returns `String` Time in seconds
   */
  public getRemainingCooldown(userId: string): number {
    const lastUsed = this.cooldowns.get(userId) || 0;
    const currentTime = Date.now();
    const remainingTime = Math.ceil((lastUsed + this.cooldown * 1000 - currentTime) / 1000);
    return remainingTime > 0 ? remainingTime : 0;
  }
  /**
   * Set the cooldown for the user for this command
   * @param {string} userId The user ID to set
   */
  public setCooldown(userId: string): void {
    this.cooldowns.set(userId, Date.now());
  }
  /**
   * Execute the command.
   * 
   * Generally our commands have the same parameter, which we will name it `query`,
   * and it is passed as our second argument for the command. Other parameters should
   * be handled separately in the command function itself.
   * 
   * The third parameter passed is the utility object, which is used for common functions.
   * There is no need to import the file, or call the client object for it.
   * @example
   * async command_name(i, query, util) {
   *   // command code here
   * };
   * @param {ChatInputCommandInteraction} i Interaction object
   */
  public async execute(i: ChatInputCommandInteraction) {
    const sub = i.options.getSubcommand();
    const query = i.options.getString("query");
    const util = (i.client as AokiClient).util;
    
    if (!["ping", "toggle", "customize"].includes(sub)) await i.deferReply();
    
    try {
      return await (this as any)[sub](i, query, util);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        const error = `\`\`\`fix\nCommand "${sub}" returned "${err}"\n\`\`\``; /* discord code block formatting */
        return this.throw(i, `Oh no, something happened internally. Please report this using \`/my fault\`, including the following:\n\n${error}`);
      }
    };
  };
  public async autocomplete(i: AutocompleteInteraction) {
    const sub = i.options.getSubcommand();
    const focusedValue = i.options.getFocused();
    const util = (i.client as AokiClient).util;

    try {
      return (this as any)[`${sub}_autocomplete`](i, focusedValue, util);
    } catch (err) {
      if (err instanceof Error) return console.log(err);
    };
  };
  /**
   * Throw an error message to the user
   * @param {String} content The content to send
   * @returns `Promise` The rejected promise
   */
  public async throw(i: ChatInputCommandInteraction, content: string): Promise<never> {
    await i.editReply({ content });
    return Promise.reject();
  };
  // Preset embed
  public get embed() {
    return new EmbedBuilder().setColor(10800862).setTimestamp();
  }
}

export default Command;
