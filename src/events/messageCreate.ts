import Event from '@struct/handlers/Event';
import { Message } from 'discord.js';
import AokiClient from '@struct/Client';

class MessageCreateEvent extends Event {
  constructor() {
    super({ name: 'messageCreate', once: false });
  }

  public async execute(client: AokiClient, msg: Message<true>) {
    if (msg.author.bot || !msg.guild || !msg.author.settings.processMessagePermission) return;

    const prefixRegex = new RegExp(`^(?:(?:hey|yo),? aoki,? )|^<@!?${client.user?.id}>`, 'i');
    if (prefixRegex.test(msg.content)) {
      const prefixMatch = msg.content.match(prefixRegex);
      if (prefixMatch) {
        await client.utils.misc.wolframAnswerPlease(prefixMatch as RegExpExecArray, msg);
      }
      return;
    }

    const timestampChannel = msg.guild.settings.timestampChannel;
    if (msg.channel.id === timestampChannel) {
      const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;
      const timestamps = msg.content.match(timestampRegex);
      if (timestamps) {
        await client.utils.misc.followUpWithProperTimestamp(msg, timestamps, timestampRegex);
        return;
      }
    }

    const replayChannelId = msg.guild.settings.tournament.mappools.find(m => m.replayChannelId === msg.channel.id)?.replayChannelId;
    if (!replayChannelId) return;
    await msg.client.utils.misc.replayRegistering(msg, msg.client as AokiClient);
  }
}

export default new MessageCreateEvent();
