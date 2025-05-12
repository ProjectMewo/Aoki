// Very specific utilities
// These are used in only one place, so they are here
import { Message, UsingClient } from 'seyfert';
import AokiError from '@struct/AokiError';

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
      }
    );
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
        content: "HTTP error, this is normal. Ask again later."
      });
      const data = await response.json();
      const answer = msg.client.utils.string.textTruncate(data.queryresult?.pods?.[1]?.subpods?.[0]?.plaintext, 1980).replace(/Wolfram\|Alpha/g, "Aoki") || "Can't answer that one.";
      // ???? what did I do here
      await msg.reply({ content: answer });
    } catch (error) {
      return AokiError.INTERNAL({
        sender: msg,
        content: `Oh, something happened. Give my sensei a yell by doing \`/my fault\`:\n\n\`\`\`fix\n${error}\n\`\`\``
      });
    }
  }
}
