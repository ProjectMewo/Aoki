import Extender from "../struct/handlers/Extender";
import { User } from "discord.js";
/**
 * Class representing an extended User.
 * @class AokiUser
 * @extends Extender
 */
export default class AokiUser extends Extender {
  constructor(client) {
    super(User);
    this.client = client;
    this.prepare([
      { name: "settings", definition: { get: this.settings } },
      { name: "update", definition: { value: this.update } },
      { name: "isOwner", definition: { get: this.isOwner } },
      { name: "checkIfVoted", definition: { value: this.checkIfVoted } },
      { name: "getSchedule", definition: { value: this.getSchedule } },
      { name: "setSchedule", definition: { value: this.setSchedule } }
    ]);
  };
  /**
   * Retrieves the default settings for this user.
   * @readonly
   * @type {Object}
   */
  settings() {
    return this.client.settings.users.get(this.id) || {
      ingamename: null,
      defaultmode: 0,
      background: null,
      pattern: null,
      color: null,
      description: "wow so magical",
      ticket: 0,
      inventory: [],
      processmessagepermission: true
    };
  };
  /**
   * Updates the guild settings associated with this user.
   * @param {Object} data - The new settings data to be applied.
   * @returns {Promise<Object>|Object} The updated user settings.
   */
  update(data) {
    return this.client.settings.users.update(this.id, data);
  };
  /**
   * Checks if the user is the owner of the client.
   * @readonly
   * @type {Boolean}
   */
  isOwner() {
    if (Array.isArray(this.client.util.owners)) {
      return this.client.util.owners.includes(this.id);
    } else {
      return this.id === this.client.util.owners;
    }
  };
  /**
   * Checks if the user has voted for the app on top.gg.
   * @readonly
   * @type {Boolean}
   */
  async checkIfVoted() {
    const userId = this.id;
    return fetch(`https://top.gg/api/bots/${this.client.user.id}/check`, {
      query: { userId },
      headers: { Authorization: process.env.DBL_TOKEN }
    })
      .then(res => res.json())
      .then(({ voted }) => Boolean(voted));
  };
  /**
   * Retrieves the user's schedule.
   * @returns {Object} The user's schedule.
   */
  async getSchedule() {
    return await this.client.settings.schedules.findOne("id", this.id);
  };
  /**
   * Updates the user's schedule.
   * @param {Object} data - The new schedule data to be applied.
   * @returns {Promise<Object>|Object} The updated schedule or a promise resolving to it.
   */
  async setSchedule(obj) {
    return await this.client.settings.schedules.update(this.id, obj);
  }; 
}