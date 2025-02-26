import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

class Command {
  constructor(options) {
    this.data = options.data;
    this.permissions = options.permissions || [];
    this.cooldown = options.cooldown || 0;
    this.cooldowns = new Map();
  }
  /**
   * Check if given user has all specified guild permissions
   * @param {Object} i Interaction object
   * @returns `Boolean` Whether the provided user has the required guild permissions
   */
  hasPermissions(i) {
    if (!this.permissions.length) return true;

    const member = i.guild.members.cache.get(i.user.id);
    return this.permissions.every(permission => member.permissions.has(PermissionFlagsBits[permission]));
  }
  /**
   * Check if given user is on cooldown for this command
   * @param {String} userId The user ID to check
   * @returns `Boolean` Whether the user is on cooldown
   */
  isOnCooldown(userId) {
    if (!this.cooldowns.has(userId)) return false;

    const expirationTime = this.cooldowns.get(userId) + this.cooldown * 1000;
    return Date.now() < expirationTime;
  }
  /**
   * Get the duration remaining for the user to be able to execute this command again
   * @param {String} userId The user ID to check
   * @returns `String` Time in seconds
   */
  getRemainingCooldown(userId) {
    const currentTime = Date.now();
    const cooldownTime = this.cooldowns.get(userId);
    const remainingTime = Math.ceil((cooldownTime + this.cooldown * 1000 - currentTime) / 1000);
    return remainingTime;
  }
  /**
   * Set the cooldown for the user for this command
   * @param {String} userId The user ID to set
   */
  setCooldown(userId) {
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
   * @param {Object} i Interaction object
   */
  async execute(i) {
    this.i = i;
    const sub = i.options.getSubcommand();
    const query = i.options.getString("query");
    const util = i.client.util;

    if (!["ping", "toggle", "customize"].includes(sub)) await i.deferReply();
    
    try {
      return await this[sub](i, query, util);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err);
        const error = `\`\`\`fix\nCommand "${sub}" returned "${err}"\n\`\`\``; /* discord code block formatting */
        return this.throw(i, `Oh no, something happened internally. Please report this using \`/my fault\`, including the following:\n\n${error}`);
      }
    };
  };
  async autocomplete(i) {
    this.i = i;
    const sub = i.options.getSubcommand();
    const focusedValue = await i.options.getFocused();
    const util = i.client.util;

    try {
      return this[`${sub}_autocomplete`](i, focusedValue, util);
    } catch (err) {
      if (err instanceof Error) return console.log(err);
    };
  };
  /**
   * Throw an error message to the user
   * @param {String} content The content to send
   * @returns `Promise` The rejected promise
   */
  async throw(i, content) {
    await i.editReply({ content, flags: 64 });
    return Promise.reject();
  };
  // Preset embed
  get embed() {
    return new EmbedBuilder().setColor(10800862).setTimestamp();
  }
}

export default Command;
