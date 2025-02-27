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
  // read the bun v1.2.4 release notes for why we have to go from that particular version.
  // from bun v1.2.3 backwards, tagged template literals were not enforced on your queries,
  // therefore you can do things like this.client.db(query, ...params) and accidentally
  // expose your database to SQL injection attacks.
  // from bun v1.2.4 onwards, this is patched along with async requests to update a table.
  async update(id, obj) {
    if (typeof obj !== "object") throw new Error("Expected an object.");
    // combine the id with the update object
    const data = { id, ...obj };
    const updateKeys = Object.keys(obj);
    // for each key, generate key = EXCLUDED.key
    const updateClause = updateKeys
      .map((key) => `${key} = EXCLUDED.${key}`)
      .join(", ");
    // the column names are static so we can safely interpolate them with `Bun.sql#unsafe`
    const [row] = await this.client.db`
      INSERT INTO ${this.client.db(this.table)} ${this.client.db(data)}
      ON CONFLICT (id) DO UPDATE SET ${this.client.db.unsafe(updateClause)}
      RETURNING *
    `;
    this.cache.set(id, row);
    return row;
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
    // else try the database then cache it
    const [row] = await this.client.db`
      SELECT * FROM ${this.client.db(this.table)} WHERE ${this.client.db(column)} = ${value}
    `;
    if (row) this.cache.set(row.id, row);
    return row;
  }
  /**
   * Initializes this settings by loading the cache
   */
  async init() {
    // simulate TTL by cleaning up expired records
    if (this.table === "verifications") {
      // we create an index on createdat for performance
      await this.client.db`
        CREATE INDEX IF NOT EXISTS "verifications_createdat_idx" ON ${this.client.db(this.table)} (createdat)
      `;

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
