// specific functions
// these do super specific things to be here
import { Message, MessageFlags } from 'discord.js';
import AokiClient from "../struct/Client";

// generally these won't fit in the main code, so I name it junk.js
const logOnReady = (client: AokiClient): void => {
  const channel = client.channels.cache.get("864096602952433665");
  if (!channel || !('send' in channel)) return;
  channel.send({ content: `Woke up ${client.dev ? "for your development" : "to work"}.\n\nWorking with **${client.util.commatize(client.guilds.cache.size)}** servers, **${client.util.commatize(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))}** users. Also reloaded **${client.commands.size}** commands.` })
    .catch(() => null);
};

const followUpWithProperTimestamp = async (
  msg: Message,
  timestamps: string[],
  timestampRegex: RegExp
): Promise<Message> => {
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
};

const wolframAnswerPlease = async (
  prefixMatch: RegExpExecArray,
  msg: Message
): Promise<void> => {
  // extract the question
  const commandBody = msg.content.slice(prefixMatch[0].length).trim();
  if (!commandBody) return;
  // ask walpha to answer the question
  try {
    const url = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(commandBody)}&appid=${process.env.WOLFRAM_KEY}&output=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP error, this is normal. Ask again later.");
    const data = await response.json();
    const answer = (msg.client as AokiClient).util.textTruncate(data.queryresult?.pods?.[1]?.subpods?.[0]?.plaintext, 1980).replace(/Wolfram\|Alpha/g, "Aoki") || "Can't answer that one.";
    msg.reply({ content: answer });
  } catch (error) {
    await msg.reply({
      content: `Oh, something happened. Give my sensei a yell by doing \`/my fault\`:\n\n\`\`\`fix\n${error}\n\`\`\``,
      flags: 1 << 6
    }).catch(() => { });
  }
};

export { logOnReady, wolframAnswerPlease, followUpWithProperTimestamp };
