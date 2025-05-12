import { createEvent } from 'seyfert';

export default createEvent({
  data: { once: false, name: 'messageCreate' },
  async run(msg, client) {
    if (msg.author.bot || !msg.guildId || !msg.author.settings.processMessagePermission) return;
    const guild = await client.guilds.fetch(msg.guildId);

    const prefixRegex = new RegExp(`^(?:(?:hey|yo),? aoki,? )|^<@!?${client.me?.id}>`, 'i');
    if (prefixRegex.test(msg.content)) {
      const prefixMatch = msg.content.match(prefixRegex);
      if (prefixMatch) {
        await client.utils.misc.wolframAnswerPlease(prefixMatch as RegExpExecArray, msg);
      }
      return;
    }

    const timestampChannel = guild.settings.timestampChannel;
    if (
      Array.isArray(timestampChannel) ? 
        timestampChannel.includes(msg.channelId) : 
        msg.channelId === timestampChannel
    ) {
      const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;
      const timestamps = msg.content.match(timestampRegex);
      if (timestamps) {
        await client.utils.misc.followUpWithProperTimestamp(msg, timestamps, timestampRegex);
        return;
      }
    }

    // TODO: migrate replayRegistering somewhere else
    // const replayChannelId = guild.settings.tournament.mappools.find(m => m.replayChannelId === msg.channelId)?.replayChannelId;
    // if (!replayChannelId) return;
    // await msg.client.utils.misc.replayRegistering(msg, msg.client as AokiClient);
  }
})