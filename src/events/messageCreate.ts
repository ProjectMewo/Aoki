import Event from '@struct/handlers/Event';
import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Message
} from 'discord.js';
import AokiClient from '@struct/Client';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

class MessageCreateEvent extends Event {
  constructor() {
    super({ name: 'messageCreate', once: false });
  }

  public async execute(client: AokiClient, msg: Message) {
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

    const imageAttachment = msg.attachments.find(att => att.contentType?.startsWith('image/'));
    const replayAttachment = msg.attachments.find(att => att.name?.endsWith('.osr'));

    if (!imageAttachment || !replayAttachment) {
      await msg.reply({ content: 'Please include both a result screen image and a replay file (.osr).' });
      return;
    }

    try {
      const imageBuffer = Buffer.from(await fetch(imageAttachment.url).then(res => res.arrayBuffer()) as ArrayBuffer);
      const metadata = await sharp(imageBuffer).metadata();
      const croppedImageBuffer = await sharp(imageBuffer)
        .extract({ left: 0, top: 0, width: metadata.width || 1000, height: 100 })
        .toBuffer();

      const ocrResult = await Tesseract.recognize(croppedImageBuffer, 'eng');
      const extractedText = ocrResult.data.text;

      const titleMatch = extractedText.match(/(.+?)\s-\s(.+?)\s\[(.+?)\]/) || 
                         extractedText.match(/(.+?)\s-\s(.+?)\s\[(.+)/) || 
                         extractedText.match(/(.+?)\s-\s(.+)/);
      const replayerRegex = /Played by (.+?) on/;
      const replayerMatch = extractedText.match(replayerRegex);

      if (!titleMatch || !replayerMatch) {
        await msg.reply({ content: 'Could not extract the beatmap title, difficulty, or replayer name from the result screen. Please ensure the image is clear.' });
        return;
      }

      const [, artist, title, difficulty] = titleMatch;
      const replayer = replayerMatch[1];
      const fullTitle = `${artist} - ${title} [${difficulty}]`;

      let closestSuggestion = null;
      const allMatches = [];
      for (const mappool of msg.guild.settings.tournament.mappools) {
        const mapTitles = mappool.maps.map(map => map.fullRecognizer);
        const matches = client.utils.string.findAllMatchingTitles(fullTitle, mapTitles);

        allMatches.push(...matches.map(match => {
          const matchedMap = mappool.maps.find(map => map.fullRecognizer === match);
          return { round: mappool.round, title: match, slot: matchedMap?.slot || 'Unknown' };
        }));

        if (!closestSuggestion) {
          closestSuggestion = client.utils.string.findClosestTitle(fullTitle, mapTitles);
        }
      }

      if (closestSuggestion) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId('confirm_match').setLabel('Yes, that\'s right').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('reject_match').setLabel('No, it\'s not correct').setStyle(ButtonStyle.Secondary)
        );

        const reply = await msg.reply({
          content: `The closest match to the replay title is **${closestSuggestion}**. Is this correct?`,
          components: [row]
        });

        try {
          const interaction = await reply.awaitMessageComponent({
            filter: i => i.user.id === msg.author.id && ['confirm_match', 'reject_match'].includes(i.customId),
            time: 15000
          });

          if (interaction.customId === 'confirm_match') {
            const matchedMappool = msg.guild.settings.tournament.mappools.find(m => 
              m.maps.some(map => map.fullRecognizer === closestSuggestion)
            );
            const matchedMap = matchedMappool?.maps.find(map => map.fullRecognizer === closestSuggestion);

            allMatches.push({
              round: matchedMappool?.round,
              title: closestSuggestion,
              slot: matchedMap?.slot || 'Unknown'
            });
            await interaction.update({ content: `Matched to **${closestSuggestion}**.`, components: [] });
          } else {
            await interaction.update({ content: 'Please rename the file to clarify the intended beatmap title.', components: [] });
            return;
          }
        } catch {
          await reply.edit({ content: 'No response received. Please try again.', components: [] });
          return;
        }
      }

      if (allMatches.length === 0) {
        await msg.reply({ content: 'Could not match the replay to any map in the mappool.' });
        return;
      }

      if (allMatches.length > 1) {
        const list = allMatches.map(m => `• ${m.title} (${m.round})`).join('\n');
        await msg.reply({ content: `Multiple matches found:\n${list}` });
        return;
      }

      const matchedSlot = allMatches[0];
      const replayData = {
        slot: matchedSlot.slot || 'Unknown',
        replayer,
        messageUrl: msg.url
      };

      const mappool = msg.guild.settings.tournament.mappools.find(m => m.round === matchedSlot.round);
      if (mappool) {
        // Ensure only one replay per slot
        mappool.replays = mappool.replays.filter(r => r.slot !== replayData.slot);
        mappool.replays.push(replayData);
        await msg.guild.update({ tournament: msg.guild.settings.tournament });
      }

      await msg.reply({ content: `Replay successfully received and matched to **${replayData.slot}** of **${matchedSlot.round}** by **${replayer}**.` });
    } catch (error) {
      console.error('OCR Error:', error);
      await msg.reply({ content: 'An error occurred while processing the result screen. Please try again.' });
    }
  }
}

export default new MessageCreateEvent();
