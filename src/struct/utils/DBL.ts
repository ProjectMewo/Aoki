import AokiClient from "../Client";

// Mock for a DBL library instead of installing it
export default class DBL {
  public client: AokiClient;
  public token: string | undefined;
  constructor(client: AokiClient) {
    this.client = client;
    this.token = process.env.DBL_TOKEN;
  }

  public async post() {
    const server_count = (await this.client.guilds.list()).length;
    if (server_count === this.client.lastGuildCount) return;

    if (!this.client.me?.id) return;
    return fetch(`https://top.gg/api/bots/${this.client.me.id}/stats`, {
      method: 'POST',
      body: JSON.stringify({ server_count }),
      headers: {
        'Authorization': process.env.DBL_TOKEN || "",
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (!res.ok) throw new Error("Failed to post"); else {
        this.client.logger.info("Posted statistics to top.gg");
        this.client.lastGuildCount = server_count;
      }
    }).catch(err => this.client.logger.error(`Something happened, debugging might work: ${err}`));
  };
}
