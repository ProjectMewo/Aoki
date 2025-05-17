import { Collection } from "seyfert";

export default class Settings {
  private collection: string;
  private cache: Collection<string, any>;

  constructor(collection: string) {
    this.collection = collection;
    this.cache = new Collection();
  }

  /**
   * Get a cached document.
   */
  get(id: string): object | undefined {
    return this.cache.get(id);
  }

  /**
   * Sync one document from API and store in cache.
   */
  async sync(id: string): Promise<object> {
    const res = await fetch(`${process.env.DB}/${this.collection}/${id}`, {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_KEY}` }
    });

    if (!res.ok) return {};
    const data = await res.json();
    this.cache.set(id, data);
    return data;
  }

  /**
   * Bulk-populate cache on init.
   */
  async init(): Promise<void> {
    const res = await fetch(`${process.env.DB}/${this.collection}/all`, {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_KEY}` }
    });

    if (!res.ok) throw new Error(`Failed to populate ${this.collection}`);

    const docs = await res.json();
    for (const doc of docs) {
      if (doc?.id) this.cache.set(doc.id, doc);
    }
  }

  /**
   * Force flush entire cache or a single entry.
   */
  flush(id?: string): void {
    if (id) this.cache.delete(id);
    else this.cache.clear();
  }

  /**
   * Upsert a document and update cache.
   */
  async update(id: string, obj: object): Promise<object> {
    const res = await fetch(`${process.env.DB}/${this.collection}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_KEY}`
      },
      body: JSON.stringify(obj)
    });

    if (!res.ok) throw new Error(`Failed to update ${this.collection}/${id}`);

    const updated = { id, ...obj };
    this.cache.set(id, updated);
    return updated;
  }

  /**
   * Filter query on the API server.
   */
  async findOne(filter: object): Promise<object> {
    const res = await fetch(`${process.env.DB}/${this.collection}/find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_KEY}`
      },
      body: JSON.stringify(filter)
    });

    if (!res.ok) return {};
    return await res.json();
  }
}
