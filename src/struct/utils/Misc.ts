// Very specific utilities
// These are used in only one place, so they are here
import { Message, ActionRow, Button } from 'seyfert';
import { ButtonStyle } from 'seyfert/lib/types';
import { UsingClient } from 'seyfert';
import AokiError from '@struct/AokiError';

interface MatchSlot {
  round: string | undefined;
  title: string | undefined;
  slot: string | undefined;
};

export default class MiscUtil {
  /**
   * Log a message when the client is ready
   * @param {AokiClient} client The client object
   */
  public async logOnReady(client: UsingClient): Promise<void> {
    const guildCount = client.utils.string.commatize((await client.guilds.list()).length);
    const commandCount = client.commands.values.length;
    await client.messages.write(
      process.env.LOG_CHANNEL!, {
      content: [
        `Woke up ${client.dev ? "for your development" : "to work"}.\n\n`,
        `Currently with **${guildCount}** servers. `,
        `Also reloaded **${commandCount}** commands.`
      ].join("")
    });
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
    let message = msg.t.miscUtil.clickOnTimestamp;
    for (const timestamp of timestamps) {
      const res = timestampRegex.exec(timestamp);
      timestampRegex.lastIndex = 0;
      if (!res) continue;
      message += `- [${timestamp}](https://aoki.hackers.moe/osuedit?time=${res[1]}:${res[2]}:${res[3]}`;
      if (res[4]) message += `-${res[4]}`;
      message += ")\n";
    };
    // send the linked timestamps
    return msg.reply({ content: message });
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
        content: msg.t.miscUtil.httpError
      });
      const data = await response.json();
      const answer = msg.client.utils.string.textTruncate(data.queryresult?.pods?.[1]?.subpods?.[0]?.plaintext, 1980).replace(/Wolfram\|Alpha/g, "Aoki") || msg.t.miscUtil.cantAnswer;
      // ???? what did I do here
      await msg.reply({ content: answer });
    } catch (error) {
      return AokiError.INTERNAL({
        sender: msg,
        content: msg.t.miscUtil.apiError
      });
    }
  }

  public async replayRegistering(
    msg: Message,
    client: UsingClient
  ): Promise<void> {
    const imageAttachment = msg.attachments.find(att => att.contentType?.startsWith('image/'));
    const replayAttachment = msg.attachments.find(att => att.filename?.endsWith('.osr'));

    if (!imageAttachment || !replayAttachment) {
      await msg.reply({
        content: msg.t.miscUtil.rr.noImOrRe
      });
      return;
    }

    try {
      const apiRes = await fetch(`${process.env.DB}/ocr/replay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.INTERNAL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: imageAttachment.url })
      });

      if (!apiRes.ok) {
        throw new Error(`API returned ${apiRes.status}`);
      }

      const { fullTitle, replayer } = await apiRes.json();
      if (!fullTitle || !replayer) {
        await msg.reply({ content: msg.t.miscUtil.rr.noExtract });
        return;
      }

      // Try matching map title from tournament mappools
      let closestSuggestion = null;
      const allMatches: Array<MatchSlot> = [];

      const guild = await msg.client.guilds.fetch(msg.guildId!);

      for (const mappool of guild.settings.tournament.mappools) {
        const mapTitles = mappool.maps.map(map => map.fullRecognizer);
        const matches = client.utils.string.findAllMatchingTitles(fullTitle, mapTitles);

        allMatches.push(...matches.map(match => {
          const matchedMap = mappool.maps.find(map => map.fullRecognizer === match);
          return {
            round: mappool.round,
            title: match,
            slot: matchedMap?.slot || msg.t.miscUtil.rr.unknown
          };
        }));

        if (!closestSuggestion) {
          closestSuggestion = client.utils.string.findClosestTitle(fullTitle, mapTitles);
        }
      }

      // Let user confirm closest match if needed
      if (closestSuggestion) {
        const row = new ActionRow<Button>().addComponents(
          new Button().setCustomId('confirm_match').setLabel(msg.t.miscUtil.rr.yep).setStyle(ButtonStyle.Primary),
          new Button().setCustomId('reject_match').setLabel(msg.t.miscUtil.rr.nop).setStyle(ButtonStyle.Secondary)
        );

        const reply = await msg.reply({
          content: msg.t.miscUtil.rr.closest(closestSuggestion),
          components: [row]
        }, true);

        try {
          const collector = reply.createComponentCollector({
            filter: i => i.user.id === msg.author.id,
            timeout: 15000
          });

          collector.run('confirm_match', async i => {
            const matchedMappool = guild.settings.tournament.mappools.find(m =>
              m.maps.some(map => map.fullRecognizer === closestSuggestion)
            );
            const matchedMap = matchedMappool?.maps.find(map => map.fullRecognizer === closestSuggestion);

            allMatches.push({
              round: matchedMappool?.round,
              title: closestSuggestion,
              slot: matchedMap?.slot || msg.t.miscUtil.rr.unknown
            });

            const matchedSlot = allMatches[0];
            const replayData = {
              slot: matchedSlot.slot || msg.t.miscUtil.rr.unknown,
              replayer,
              messageUrl: msg.url
            };

            const mappool = guild.settings.tournament.mappools.find(m => m.round === matchedSlot.round);
            if (mappool) {
              // Deduplicate replays per slot
              mappool.replays = mappool.replays.filter(r => r.slot !== replayData.slot);
              mappool.replays.push(replayData);
              await guild.update({ tournament: guild.settings.tournament });
            }

            await msg.reply({
              content: msg.t.miscUtil.rr.matched(replayData.slot, matchedSlot.round || msg.t.miscUtil.rr.unknown, replayer)
            });

            await i.update({ content: msg.t.miscUtil.rr.closestMatched(closestSuggestion), components: [] });
          });

          collector.run('reject_match', async i => {
            await i.update({ content: msg.t.miscUtil.rr.reject, components: [] });
            return;
          });
        } catch {
          await reply.edit({ content: msg.t.miscUtil.rr.noRes, components: [] });
          return;
        }
      }
    } catch (err) {
      console.error('Replay OCR error:', err);
      await msg.reply({
        content: msg.t.miscUtil.rr.err
      });
    }
  }

}
