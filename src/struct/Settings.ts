import { Collection } from "discord.js";
import AokiClient from "./Client";
/**
 * Manages settings for a specific table.
 * To make sure the cache is in sync methods from here must be used.
 * 
 * @example
 * // Add a new settings instance for each table to manage in client
 * this.settings = new Settings(this, "guilds");
 * // Then use it anywhere
 * this.client.settings[prop].update({ ... });
 */
export default class Settings {
  /**
   * The client instance of this setting
   * @type {AokiClient}
   */
  private client: AokiClient;
  /**
   * The cache of this setting
   * @type {Collection<string, any>}
   */
  private cache: Collection<string, any>;
  /**
   * The collection name of this setting
   * @type {string}
   */
  private collection: string;
  /**
   * The default values of this setting
   * @type {object}
   */
  private defaults: object;
  constructor(
    client: AokiClient, 
    collection: string, 
    defaults = {}
  ) {
    this.client = client;
    this.cache = new Collection();
    this.collection = collection;
    this.defaults = defaults;
  };
  /**
   * Get an entry by ID from cache.
   * @param {String} id - The ID to lookup the cache.
   * @returns {?Object} The document from the cache if available.
   */
  get(id: string): object | null {
    return this.cache.get(id);
  };
  /**
   * Updates settings for the table this settings instance manages.
   * 
   * The input is safe for upserts. If the document does not exist it inserts it.
   * @example
   * update(id, { something: true, another_thing: [] });
   * @param {String} id - The ID of the document to update.
   * @param {Object} obj - An object with key-value changes to apply.
   * @returns {Object} The updated object from the database.
   */
  async update(id: string, obj: object): Promise<object> {
    if (typeof obj !== "object") throw new Error("Expected an object.");
    const value = await this.client.db!.collection(this.collection).findOneAndUpdate({ id }, { $set: obj }, {
      upsert: true,
      // https://mongodb.github.io/node-mongodb-native/6.8/interfaces/FindOneAndUpdateOptions.html#returnDocument
      returnDocument: 'after',
      projection: { _id: 0 }
    });
    if (value) {
      this.cache.set(id, this.mergeDefault(this.defaults, value));
    }
    return value || {};
  };
  /**
   * Syncs the cache with the database.
   * Use this in case the cache becomes outdated.
   * @param {String} id - ID of the document to sync.
   * @returns {Object} The newly fetched data from the database.
   */
  async sync(id: string): Promise<object> {
    const doc = await this.client.db!.collection(this.collection).findOne({ id }, { projection: { _id: 0 } });
    if (!doc) return {};
    this.cache.set(id, this.mergeDefault(this.defaults, doc));
    return doc;
  };
  /**
   * Deletes a document with the given ID.
   * @param {String} id - ID of the document to delete.
   */
  async delete(id: string) {
    await this.client.db!.collection(this.collection).deleteOne({ id });
    this.cache.delete(id);
  };
  /**
   * Alias to db.collection(col).find(...)
   * @param {any[]} args - Arguments to pass to the find method.
   */
  find(...args: [any]) {
    return this.client.db!.collection(this.collection).find(...args);
  };
  /**
   * Alias to db.collection(col).findOne(...)
   * @param {any[]} args - Arguments to pass to the findOne method
   */
  findOne(...args: [any]) {
    return this.client.db!.collection(this.collection).findOne(...args);
  };
  /**
  * Return cache if available, else return the default values.
  * @param {String} id - The ID to lookup the cache.
  * @returns {Object} The document from the cache if available.
  */
  getDefaults(id: string) {
    return this.cache.get(id) || this.defaults;
  }
  /**
   * Initializes this settings by loading the cache.
   * Call this before the client is logged in.
   */
  async init() {
    const docs = await this.client.db!
      .collection(this.collection)
      .find({}, { projection: { _id: 0 } })
      .toArray();

    // set verification collection ttl to 1h
    if (this.collection == "verifications") await this.client.db!
      .collection(this.collection)
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

    for (const doc of docs) this.cache.set(doc.id, this.mergeDefault(this.defaults, doc));
  };
  
  // discord.js<=14.0.0
  /**
   * Sets default properties on an object that aren't already specified.
   * @param {Object} def Default properties
   * @param {Object} given Object to assign defaults to
   * @returns {Object}
   */
  mergeDefault(
    def: Record<string, any>, 
    given: Record<string, any>
  ): Record<string, any> {
    if (!given) return def;
    for (const key in def) {
      if (!Object.hasOwn(given, key) || given[key] === undefined) {
        given[key] = def[key];
      } else if (given[key] === Object(given[key])) {
        given[key] = this.mergeDefault(def[key], given[key]);
      }
    }

    return given;
  };
};