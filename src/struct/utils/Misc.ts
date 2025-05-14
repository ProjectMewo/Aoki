// Very specific utilities
// These are used in only one place, so they are here
import { 
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import AokiClient from "@struct/Client";
import AokiError from '@struct/handlers/AokiError';
import TextUtil from '@utils/String';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

const textUtil = new TextUtil;

export default class MiscUtil {
  /**
   * Log a message when the client is ready
   * @param {AokiClient} client The client object
   */
  public logOnReady(client: AokiClient): void {
    const channel = client.channels.cache.get("864096602952433665");
    if (!channel || !('send' in channel)) return;
    channel.send({ content: `Woke up ${client.dev ? "for your development" : "to work"}.\n\nWorking with **${textUtil.commatize(client.guilds.cache.size)}** servers, **${textUtil.commatize(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))}** users. Also reloaded **${client.commands.size}** commands.` })
      .catch(() => null);
  }

  /**
   * Follow up with the proper timestamp
   * @param {Message} msg The message object
   * @param {string[]} timestamps The timestamps to follow up
   * @param {RegExp} timestampRegex The regex to match the timestamps
   * @returns {Promise<Message>} The sent message
   */
  public async followUpWithProperTimestamp(
    msg: Message,
    timestamps: string[],
    timestampRegex: RegExp
  ): Promise<Message> {
    // replace each timestamp with the linked one
    let message = "*Click on the timestamp to open in editor.*\n\n";
    for (const timestamp of timestamps) {
      const res = timestampRegex.exec(timestamp);
      timestampRegex.lastIndex = 0;
      if (!res) continue;
      message += `- [${timestamp}](https://aoki.hackers.moe/osuedit?time=${res[1]}:${res[2]}:${res[3]}`;
      if (res[4]) message += `-${res[4]}`;
      message += ")\n";
    };
    // send the linked timestamps
    return msg.reply({ content: message, allowedMentions: { repliedUser: false } });
  }

  /**
   * Ask Wolfram Alpha to answer a question
   * @param {RegExpExecArray} prefixMatch The prefix match
   * @param {Message} msg The message object
   */
  public async wolframAnswerPlease(
    prefixMatch: RegExpExecArray,
    msg: Message
  ): Promise<void> {
    // extract the question
    const commandBody = msg.content.slice(prefixMatch[0].length).trim();
    if (!commandBody) return;
    // ask walpha to answer the question
    try {
      const url = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(commandBody)}&appid=${process.env.WOLFRAM_KEY}&output=json`;
      const response = await fetch(url);
      if (!response.ok) return AokiError.API_ERROR({
        sender: msg,
        content: "HTTP error, this is normal. Ask again later."
      });
      const data = await response.json();
      const textUtil = new TextUtil();
      const answer = textUtil.textTruncate(data.queryresult?.pods?.[1]?.subpods?.[0]?.plaintext, 1980).replace(/Wolfram\|Alpha/g, "Aoki") || "Can't answer that one.";
      // ???? what did I do here
      await msg.reply({ content: answer });
    } catch (error) {
      return AokiError.INTERNAL({
        sender: msg,
        content: `Oh, something happened. Give my sensei a yell by doing \`/my fault\`:\n\n\`\`\`fix\n${error}\n\`\`\``
      });
    }
  }

  public async replayRegistering(
    msg: Message<true>,
    client: AokiClient
  ): Promise<void> {
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
