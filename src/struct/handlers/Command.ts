import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder
} from 'discord.js';
import { Subcommand, CommandOptions } from './Subcommand';
import AokiError from './AokiError';

/**
 * Base class for all commands.
 * To make a new command (as in a new master command with subcommands
 * in it), extend this class and implement methods.
 * 
 * The master command should be a subcommands only command.
 * The command folder should have `[cmd].ts` files and an `index.ts`.
 * 
 * In the `index.ts` file, it should import all the other subcommands,
 * specify all the required parameters, then export it.
 * 
 * This class will handle all the functionalities. 
 */
export default class Command {
  /**
   * The name of the master command
   * @type {string}
   */ 
  public name: string;
  /**
   * The description of the master command
   * @type {string}
   */
  public description: string;
  /**
   * The cooldown for the master command
   * @type {number}
   */
  public cooldown: number;
  /**
   * The cooldowns for each user
   * @type {Map<string, number>}
   */
  private cooldowns: Map<string, number>;
  /**
   * The permissions required for each subcommand
   * If there is none, either don't provide anything or
   * provide an empty array.
   * @type {Array<keyof typeof PermissionFlagsBits>}
   */
  public subcommands: Array<Subcommand>;

  constructor(options: {
    name: string,
    description: string,
    cooldown?: number,
    subcommands: Array<Subcommand>
  }) {
    this.name = options.name;
    this.description = options.description;
    this.cooldown = options.cooldown || 0;
    this.cooldowns = new Map();
    this.subcommands = options.subcommands;
  };

  /**
   * Execute the command.
   * 
   * When we say execute in a master command file,
   * because of how we structure our commands, it
   * means we are executing a subcommand.
   */
  public async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Figure out the subcommand
    const subcommand = i.options.getSubcommand();
    // Get the subcommand object
    const command = this.subcommands.find(sub => sub.name === subcommand);
    // If the subcommand doesn't exist, return
    // Additionally log this to console to let us know
    // the commands aren't synced between instances of the bot.
    if (!command) {
      console.warn(`Subcommand ${subcommand} not found in ${this.name} - this might be a mistake.`);
      return;
    };
    // Check if the user has the permissions to execute this command
    if (!command.hasPermissions(i)) {
      return AokiError.PERMISSION({
        sender: i,
        content: `You need the following permissions to use this command: ${command.permissions.join(', ')}`
      });
    };
    // Check if the user is on cooldown
    if (this.isOnCooldown(i.user.id)) {
      return AokiError.COOLDOWN({
        sender: i,
        content: `Baka, I'm not a spammer. Try again in ${this.getRemainingCooldown(i.user.id)} seconds.`
      });
    };
    // Execute the subcommand
    await command.execute(i);
    // Set the cooldown for the user
    this.cooldowns.set(i.user.id, Date.now());
  };

  /**
   * Handle an autocomplete interaction.
   * This is optional and can be implemented if needed.
   */
  public async autocomplete(i: AutocompleteInteraction): Promise<void> {
    // Figure out the subcommand
    const subcommand = i.options.getSubcommand();
    // Get the subcommand object
    const command = this.subcommands.find(sub => sub.name === subcommand);
    // If the subcommand doesn't exist, return
    // Additionally log this to console to let us know
    // the commands aren't synced between instances of the bot.
    if (!command) {
      console.warn(`Subcommand ${subcommand} not found in ${this.name} - this might be a mistake.`);
      return;
    };
    // Execute the autocomplete
    await command.autocomplete(i);
  };

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
   * Get the duration remaining for the user to be able to 
   * execute this command again.
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
   * Export a valid SlashCommandBuilder object.
   * 
   * This function has a compute complexity of O(n^2) due to the
   * subcommand adding and its options logic. Use only when we make
   * new subcommands or options and we need to have changes reflected
   * on Discord.
   * @returns {SlashCommandBuilder}
   */
  public export(): SlashCommandBuilder {
    // Create master command
    const command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);
    // Add all subcommands
    for (const sub of this.subcommands) {
      command.addSubcommand(subcommand => {
        subcommand.setName(sub.name).setDescription(sub.description);
        // Add options if they exist
        if (sub.options) {
          for (const opt of sub.options) 
            this.addOptionToSubcommand(subcommand, opt);
        };
        return subcommand;
      });
    };
    return command;
  }

  /**
   * Helper method to add an option to a subcommand
   * @param {SlashCommandSubcommandBuilder} subcommand The subcommand to add the option to
   * @param {CommandOptions} opt The option to add
   */
  private addOptionToSubcommand(
    subcommand: SlashCommandSubcommandBuilder, 
    opt: CommandOptions
  ) {
    // Check if the option type is supported
    const methodName = `add${opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}Option` as keyof typeof subcommand;
    // If this occurs, throw an error on runtime
    // This means our types have been mistyped somewhere in the
    // CommandOptions interface.
    if (!(methodName in subcommand)) {
      throw new Error(`Option type '${opt.type}' is not supported`);
    };
    // TypeScript doesn't know subcommand[methodName] is invokable
    // Cast it to a function to invoke it
    const method = subcommand[methodName] as Function;
    // We know the option's type by implicitly telling so,
    // and typing it properly is not preferred in this case.
    // Cast it to any to avoid TypeScript errors.
    method.call(subcommand, (option: any) => {
      option
        .setName(opt.name)
        .setDescription(opt.description)
        .setRequired(opt.required ?? false);
      
      // Set autocomplete if needed
      if (opt.isAutocomplete) {
        option.setAutocomplete(true);
      }
      
      // Add choices only for string options
      if (opt.type === 'string' && opt.choices) {
        (option as SlashCommandStringOption).addChoices(...opt.choices);
      }
      return option;
    });
  }
}
