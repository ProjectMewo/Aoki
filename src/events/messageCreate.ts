import Event from '@struct/handlers/Event';
import { Message } from 'discord.js';
import AokiClient from '@struct/Client';
import AokiError from '@struct/handlers/AokiError';

class MessageCreateEvent extends Event {
  constructor() {
    super({
      name: 'messageCreate',
      once: false
    });
  }

  /**
   * Execute the event
   * @param {Object} client Client object
   * @param {Object} msg Message object from Discord
   */
  public async execute(client: AokiClient, msg: Message) {
    // if this is a bot, ignore it
    if (msg.author.bot) return;
    // if we're not in a guild, temporarily discard and return AokiError
    if (!msg.guild) return AokiError.GENERIC({
      sender: msg,
      content: 'I can\'t do that in your DMs, baka. But maybe one day. Sensei told me he will do it.'
    });

    // check if the user allow us to process their messages
    // if not, end there.
    if (!msg.author.settings.processmessagepermission) return;

    // match "hey aoki" or "yo aoki" or bot mention
    const prefixRegex = new RegExp(`^(?:(?:hey|yo),? aoki,? )|^<@!?${client.user?.id}>`, 'i');
    const prefixMatch = prefixRegex.exec(msg.content);
    if (prefixMatch) { 
      await client.utils.misc.wolframAnswerPlease(prefixMatch, msg);
      return;
    };

    // match timestamp if the message is in the designated
    // channel of the guild
    const timestampchannel = msg.guild.settings.timestampchannel;
    if (msg.channel.id == timestampchannel) {
      const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;
      const timestamps = msg.content.match(timestampRegex);
      if (timestamps) { 
        await client.utils.misc.followUpWithProperTimestamp(msg, timestamps, timestampRegex); 
        return; 
      }
    }
  }
}

export default new MessageCreateEvent();
