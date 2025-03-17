import {
  RestOrArray,
  APIApplicationCommandOptionChoice,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  AutocompleteInteraction
} from 'discord.js';

/**
 * Base class for a subcommand to be valid.
 * 
 * To make a subcommand inside a master command folder,
 * extend this class and implement the `execute` method.
 */
class Subcommand {
  public name: string;
  public description: string;
  public options: Array<CommandOptions>;
  public permissions: Array<keyof typeof PermissionFlagsBits>
  constructor(options: { 
    name: string, 
    description: string, 
    permissions: Array<keyof typeof PermissionFlagsBits>,
    options: Array<CommandOptions> 
  }) {
    this.name = options.name;
    this.description = options.description;
    this.permissions = options.permissions;
    this.options = options.options;
  };
  /**
   * Execute the subcommand.
   * We expect this method to be implemented in the
   * subcommand files.
   */
  // @ts-ignore
  public async execute(i: ChatInputCommandInteraction): Promise<void> {
    throw new Error('Method not implemented.');
  };
  /**
   * Handle an autocomplete interaction.
   * This is optional and can be implemented if needed.
   */
  // @ts-ignore
  public async autocomplete(i: AutocompleteInteraction): Promise<void> {
    throw new Error('Method not implemented.');
  };
  /**
   * Check if given user has all specified guild permissions.
   * @param {ChatInputCommandInteraction} i Interaction object
   * @returns {boolean}
   */
  public hasPermissions(i: ChatInputCommandInteraction): boolean {
    if (!this.permissions.length) return true;
    const member = i.guild?.members.cache.get(i.user.id);
    return this.permissions.every((permission) => member?.permissions.has(permission));
  };
}

/**
 * Options for a subcommand.
 * This is a helper for command creation in the master
 * command handler.
 * 
 * To construct the options, follow the example.
 * @example
 * options: [{
 *   type: 'string',
 *   name: 'query',
 *   description: 'The query to add option to',
 *   choices: [
 *     { name: 'Choice 1', value: 'choice1' },
 *     { name: 'Choice 2', value: 'choice2' }
 *   ],
 *   isAutocomplete: true,
 *   required: true
 * }];
 * 
 * // ...add more options if needed.
 */
interface CommandOptions {
  /**
   * The option's type
   */
  type: 'string' | 'number' | 'boolean' | 'user' | 'channel' | 'role' | 'mentionable' | 'attachment',
  /**
   * The name of the option
   */
  name: string,
  /**
   * The description of the option
   */
  description: string,
  /**
   * Whether the option is autocomplete
   */
  isAutocomplete?: boolean,
  /**
   * The choices for the option
   * @example
   * choices: [
   *   { name: 'Choice 1', value: 'choice1' },
   *   { name: 'Choice 2', value: 'choice2' }
   * ]
   */
  choices?: RestOrArray<APIApplicationCommandOptionChoice<any>>,
  /**
   * Whether the option is required
   */
  required: boolean
};

export { Subcommand };
export type { CommandOptions };
