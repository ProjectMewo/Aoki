import { Collection } from "discord.js";
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
  constructor(client, table) {
    this.client = client;
    // we try to utilize discordjs's collection for performance
    this.cache = new Collection();
    this.table = table;
  };
  /**
   * Get an entry by ID from cache.
   * @param {String} id - The ID to lookup the cache.
   * @returns {?Object} The document from the cache if available.
   */
  get(id) {
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
  async update(id, obj) {
    if (typeof obj !== "object") throw new Error("Expected an object.");
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    const query = `INSERT INTO ${this.table} (id, ${
      keys.map((key) => `${key}`).join(", ")}) VALUES ($1, ${
      keys.map((_, i) => `$${i + 2}`).join(", ")}) ON CONFLICT (id) DO UPDATE SET ${
      keys.map((key, i) => `${key} = $${i + 2}`).join(", ")} RETURNING *;`;
    const rows = await this.client.db(query, id, ...values);
    const doc = rows[0];
    this.cache.set(doc.id, doc);
    return doc;
  }
  /**
   * A simple helper to fetch one row by column name and value
   * @param {string} column
   * @param {any} value
   * @returns {Promise<object|undefined>}
   */
  async findOne(column, value) {
    // First try the cache
    const found = this.cache.find(doc => doc[column] == value);
    if (found) return found;
    
    // If not in cache, query the database
    const query = `SELECT * FROM ${this.table} WHERE ${column} = $1;`;
    const rows = await this.client.db(query, value);
    const doc = rows[0];
    if (doc) this.cache.set(doc.id, doc);
    return doc;
  }
  /**
   * Initializes this settings by loading the cache
   */
  async init() {
    // simulate TTL by cleaning up expired records
    if (this.table === "verifications") {
      // we create an index on createdat for performance
      await this.client.db.unsafe(
        `CREATE INDEX IF NOT EXISTS "verifications_createdat_idx" ON "${this.table}" (createdat)`
      );

      // then delete rows older than 1 hour
      await this.client.db`
        DELETE FROM ${this.client.db(this.table)}
        WHERE TO_TIMESTAMP(createdat::BIGINT) < NOW() - INTERVAL '1 hour'
      `;
    }
    // retrieve all rows from the table, then populate the cache
    const docs = await this.client.db`
      SELECT * FROM ${this.client.db(this.table)}
    `;
    for (const doc of docs) {
      this.cache.set(doc.id, doc);
    }

    // reinitialize this function every 1 hour
    setTimeout(() => this.init(), 1000 * 60 * 60);
  }
};
