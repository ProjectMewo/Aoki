import { createEvent } from 'seyfert';
 
export default createEvent({
  data: { once: true, name: 'botReady' },
  async run(_, client) {
    // anischedule
    await client.schedule.init();
    // post stats to dbl every start up (configure to restart every n hours)
    if (!client.dev) await client.utils.dbl.post();
    // log on ready
    await client.utils.misc.logOnReady(client);
  }
})
