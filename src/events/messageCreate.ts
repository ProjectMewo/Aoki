import Event from '../struct/handlers/Event';
import { Message, Guild } from 'discord.js';
import AokiClient from '../struct/Client';
import { followUpWithProperTimestamp, wolframAnswerPlease } from '../assets/junk';

class MessageCreateEvent extends Event {
  constructor() {
    super('messageCreate', false);
  }

  /**
   * Execute the event
   * @param {Object} client Client object
   * @param {Object} msg Message object from Discord
   */
  public async execute(client: AokiClient, msg: Message) {
    // if this is a bot, ignore it
    if (msg.author.bot) return;

    // check if the user allow us to process their messages
    // if not, end there, do nothing below
    if (!msg.author.settings.processmessagepermission) return;

    // match "hey aoki" or "yo aoki" or bot mention
    const prefixRegex = new RegExp(`^(?:(?:hey|yo),? aoki,? )|^<@!?${client.user?.id}>`, 'i');
    const prefixMatch = prefixRegex.exec(msg.content);
    if (prefixMatch) { await wolframAnswerPlease(prefixMatch, msg); return; }

    // match timestamp if the message is in the designated channel of the guild
    const timestampchannel = (msg.guild as Guild)?.settings?.timestampchannel;
    if (msg.channel.id == timestampchannel) {
      const timestampRegex = /(\d+):(\d{2}):(\d{3})\s*(\(((\d+(\|)?,?)+)\))?/gim;
      const timestamps = msg.content.match(timestampRegex);
      if (timestamps) { await followUpWithProperTimestamp(msg, timestamps, timestampRegex); return; }
    }
  }
}

export default new MessageCreateEvent();
