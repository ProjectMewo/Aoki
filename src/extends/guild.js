import Extender from "../struct/handlers/Extender";
import { Guild } from "discord.js";
/**
 * Class representing an extended Guild.
 * @class AokiGuild
 * @extends Extender
 */
export default class AokiGuild extends Extender {
  constructor(client) {
    super(Guild);
    this.client = client;
    this.prepare([
      { name: "settings", definition: { get: this.settings } },
      { name: "update", definition: { value: this.update } },
    ]);
  };
  /**
   * Retrieves the default settings for the associated guild.
   * @readonly
   * @type {Object}
   */
  settings() {
    return this.client.settings.guilds.get(this.id) || {
      timestampchannel: null,
      verificationroleid: null,
      verificationchannelid: null,
      verificationmessageid: null,
      verificationtitle: null,
      verificationdescription: null,
      verificationthumbnail: null,
      verificationcolor: null
    };
  };
  /**
   * Updates the guild settings associated with this guild.
   * @param {Object} data - The new settings data to be applied.
   * @returns {Promise<Object>|Object} The updated guild settings.
   */
  update(data) {
    return this.client.settings.guilds.update(this.id, data);
  };
}