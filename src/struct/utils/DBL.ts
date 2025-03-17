import AokiClient from "./Client";

// Mock for a DBL library instead of installing it
export default class DBL {
  public client: AokiClient;
  public token: string | undefined;
  constructor(client: AokiClient) {
    this.client = client;
    this.token = process.env.DBL_TOKEN;
  }

  public async post() {
    const server_count = this.client.guilds.cache.size;
    if (server_count === this.client.lastGuildCount) return;

    if (!this.client.user?.id) return;
    return fetch(`https://top.gg/api/bots/${this.client.user.id}/stats`, {
      method: 'POST',
      body: JSON.stringify({ server_count }),
      headers: {
        'Authorization': process.env.DBL_TOKEN || "",
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) throw new Error("Failed to post"); else {
        this.client.utils.logger.success("Posted statistics to top.gg", "[Top.gg]");
        this.client.lastGuildCount = server_count;
      }
    }).catch(err => this.client.utils.logger.error(`Something happened, debugging might work: ${err}`, "[Top.gg]"));
  };
}
