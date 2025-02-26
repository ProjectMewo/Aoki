import Event from '../struct/handlers/Event.js';
import { ActivityType } from 'discord.js';
import { logOnReady } from '../assets/junk.js';

class ReadyEvent extends Event {
  constructor() {
    super('ready', true);
  }
  /**
   * Execute the event
   * @param {Object} client Client object
   */
  async execute(client) {
    const activities = [
      "/my info",
      `I'm in ${client.util.commatize(client.guilds.cache.size)} servers!`,
      `I'm with ${client.util.commatize(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))} users!`
    ];

    if (!client.dev) {
      client.user.setPresence({ status: "online" });
      const updateStatus = () => {
        const pickedStatus = client.util.random(activities);
        client.user.setActivity(pickedStatus, { type: ActivityType.Custom });
      };
      updateStatus();
      setInterval(updateStatus, 300000);
    } else {
      client.user.setPresence({ status: "idle" });
      client.user.setActivity("I'm in development mode!", { type: ActivityType.Custom });
    };

    // anischedule
    await client.schedule.init();

    // post stats to dbl every start up (configure to restart every n hours)
    if (!client.dev) await client.poster.post();

    // log on ready
    logOnReady(client);
  };
}

export default new ReadyEvent();
