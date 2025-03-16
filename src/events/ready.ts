import Event from '../struct/handlers/Event';
import { ActivityType } from 'discord.js';
import AokiClient from '../struct/Client';

class ReadyEvent extends Event {
  constructor() {
    super({
      name: 'ready',
      once: true
    });
  }
  /**
   * Execute the event
   * @param {Object} client Client object
   */
  public async execute(client: AokiClient) {
    const activities = [
      "/my info",
      `I'm in ${client.utils.string.commatize(client.guilds.cache.size)} servers!`,
      `I'm with ${client.utils.string.commatize(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))} users!`
    ];

    if (!client.dev) {
      // we definitely know client.user exists because this only emits
      // when the client is ready, making it available for use.
      client.user!.setPresence({ status: "online" });
      const updateStatus = () => {
        const pickedStatus = client.utils.array.random(activities);
        client.user!.setActivity(pickedStatus, { type: ActivityType.Custom });
      };
      updateStatus();
      setInterval(updateStatus, 300000);
    } else {
      client.user!.setPresence({ status: "idle" });
      client.user!.setActivity("I'm in development mode!", { type: ActivityType.Custom });
    };

    // anischedule
    await client.schedule.init();

    // post stats to dbl every start up (configure to restart every n hours)
    if (!client.dev) await client.utils.dbl.post();

    // log on ready
    client.utils.misc.logOnReady(client);
  };
}

export default new ReadyEvent();
