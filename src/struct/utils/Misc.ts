// Very specific utilities
// These are used in only one place, so they are here
import { Message } from 'discord.js';
import AokiClient from "@struct/Client";
import AokiError from '@struct/handlers/AokiError';
import TextUtil from '@utils/String';
import { createWorker } from 'tesseract.js';

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

  /**
   * Perform OCR on an image to extract text
   * @param {Buffer} imageBuffer The image buffer
   * @returns {Promise<string>} The extracted text
   */
  public async performOCR(imageBuffer: Buffer): Promise<string> {
    const worker = await createWorker();
    try {
      await worker.load();
      await worker.reinitialize('eng');
      const { data: { text } } = await worker.recognize(imageBuffer);
      return text;
    } finally {
      await worker.terminate();
    }
  }
}
