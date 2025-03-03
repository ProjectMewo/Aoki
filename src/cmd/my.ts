import Command from '../struct/handlers/Command';
import * as os from "os";
import pkg from "../../package.json";
import { Attachment, version as DiscordVersion, EmbedBuilder } from 'discord.js';
import { my } from '../assets/import';
import { ChatInputCommandInteraction } from 'discord.js';
import AokiClient from '../struct/Client';
import Utilities from '../struct/Utilities';

export default new class My extends Command {
  constructor() {
    super({
      data: my,
      permissions: [],
      cooldown: 0
    });
  };

  // ping command
  async ping(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    await i.reply({ content: "Pinging..." });

    const replies = await util.getStatic("ping");

    const reply = util.random(replies)
      .replace(/{{user}}/g, i.user.username)
      .replace(/{{ms}}/g, Math.round(i.client.ws.ping));

    await i.editReply({ content: reply });
  };

  // permission command
  async rights(i: ChatInputCommandInteraction) {
    const query: string = i.options.getString("to")!.toLowerCase();
    const value: boolean = i.options.getBoolean("should_be")!;
    const settings = i.user.settings;
    if (settings[query as keyof typeof settings] == value) return this.throw(i, `Baka, that's your current settings.`);
    const res = await i.user.update({ [query]: value });
    const properQuery: { [key: string]: string } = {
      processmessagepermission: "read & process your messages",
    };
    if (res[query as keyof typeof res] == value) {
      await i.editReply({ content: `Alright, I ${value ? "will" : "won't"} **${properQuery[query]}**.` });
    } else {
      return this.throw(i, "The database might be having problems. Try executing this again.");
    };
  };

  // vote command
  async vote(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    // construct reply
    const votes: string[] = ["Vote? Sweet.", "You finally decided to show up?", "Oh, hi. I'm busy, so get it done.", "Not like I'm not busy, but sure."];
    const voteUrl: string = `https://top.gg/bot/https://top.gg/bot/${i.client.user!.id}`;
    const vote: string = `${util.random(votes)} [Do that here.](<${voteUrl}>)\n\n||If you decided to vote, thank you. You'll get extra perks in the future.||`;
    // send reply
    await i.editReply({ content: vote });
  };

  // info command
  async info(i: ChatInputCommandInteraction) {
    // construct message parts
    const description: string = [
      "Oh, it's you? Hey, I'm **Aoki**. It only means a mere blue tree, but sensei (`shimeji.rin`, by the way) can't do anything about it, unfortunately.\n",
      "Everyone calls me a tsundere. Even my sensei does that on my [Github](https://github.com/AokiOfficial/Aoki) - yes, I'm **open-source**, and documented. But I don't think I am one, it's just because *I occasionally slap people*, sorry."
    ].join("\n");
    const fields: { name: string, value: string }[] = [
      {
        name: "What can you do?",
        value: "Probably providing advanced anime information and some little utilities so you don't have to open a browser."
      },
      {
        name: "Why isn't there a help command?",
        value: "I have written descriptions for them, they're slash commands. Just follow them to get what you want, *sigh*. I'm busy, I don't have time to write those."
      }
    ];
    // construct embed
    const embed = this.embed
      .setDescription(description)
      .addFields(fields)
      .setTitle("/my info")
      .setThumbnail("https://i.imgur.com/Nar1fRE.png")
      .setFooter({ text: `Made with ❤` });
    // send
    await i.editReply({ embeds: [embed] });
  };

  // fault command
  async fault(i: ChatInputCommandInteraction, query: string | null, util: Utilities) {
    const attachment = i.options.getAttachment("attachment")!;
    // handle exceptions
    if (!query && !attachment) return this.throw(i, "Baka, I can't send nothing. At least give me an error message, an image, or something!");
    // preset embed
    const preset = this.embed
      .setTitle(`New issue!`)
      .setThumbnail("https://i.imgur.com/1xMJ0Ew.png")
      .setFooter({ text: "Take care of these, I'm out", iconURL: i.user.displayAvatarURL() })
      .setDescription(`*Sent by **${i.user.username}***\n\n**Description:** ${query || "None"}\n**Image:** ${attachment ? "" : "None"}`)
    
    // construct some utility functions
    const delay = async (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };

    const detectGibberish = async (text: string) => {
      const res = await fetch(`https://gibberish-text-detection.p.rapidapi.com/detect-gibberish`, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': process.env["RAPID_KEY"] || "",
          'X-RapidAPI-Host': 'gibberish-text-detection.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      return await res.json();
    };

    const sendErrorGibberish = async (i: ChatInputCommandInteraction) => {
      await i.editReply({ content: "I see you typing gibberish there, you baka." });
      await delay(3000);
      await i.editReply({ content: "You're not sending [these](https://i.imgur.com/C5tvxfp.png) through me, please." });
      await delay(3000);
      await i.editReply({ content: "I'll like [these](https://i.imgur.com/FRWBFXr.png) better." });
    };

    const isImageAttachment = (attachment: Attachment) => {
      return attachment.contentType?.includes("image");
    };

    const sendToLogs = async (embed: EmbedBuilder) => {
      const channel = i.client.channels.cache.get(util.logChannel);
      if (!channel || !('send' in channel)) return;
      return await channel.send({ embeds: [embed] });
    };

    const sendFeedback = async (i: ChatInputCommandInteraction, embed: EmbedBuilder) => {
      await i.editReply({ content: "Thank you for your feedback. The note will be resolved after a few working days." });
      await sendToLogs(embed);
    };

    // handle user query
    if (query && !attachment) {
      const gibberishCheck = await detectGibberish(query);
      if (gibberishCheck.noise > 0.5) {
        await sendErrorGibberish(i);
      } else {
        await sendFeedback(i, preset);
      };
    } else if (attachment) {
      if (!isImageAttachment(attachment)) {
        return await this.throw(i, "Appreciate your attachment, but for now we only support images.");
      };
      preset.setImage(attachment.url);
      await sendFeedback(i, preset);
    };
  };

  // eval
  async eval(i: ChatInputCommandInteraction, query: string, util: Utilities) {
    if (!util.owners.includes(i.user.id)) {
      return await this.throw(i, 'Baka, you can\'t do that. This command is for my sensei.');
    };
    try {
      const evaled = (0, eval)(query);
      const processedEval = typeof evaled !== 'string' 
        ? JSON.stringify(evaled, null, 2)
        : evaled;
    
      if (processedEval?.length > 1000) {
        return i.editReply({ content: "Output too big. Do this with `console.log()`." });
      }
    
      const embed = this.embed.addFields([
        {
          name: "\> Input",
          value: `\`\`\`fix\n${query}\`\`\``
        },
        {
          name: "\> Output",
          value: `\`\`\`fix\n${processedEval}\n\`\`\``
        }
      ]);
    
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await i.editReply({ content: `Baka, you messed up.\n\`\`\`fix\n${error}\n\`\`\`` });
    }
  };

  // we use weakmap here to cache the stats so we don't have to always recompute them
  async stats(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const cacheEntry = (i.client as AokiClient).statsCache.get(i.user.id);
    const cacheTTL = 10 * 60 * 1000;
    if (cacheEntry && (Date.now() - cacheEntry.timestamp < cacheTTL)) {
      return await i.editReply({ embeds: [cacheEntry.embed] });
    }

    const totalMem: number = os.totalmem();
    const freeMem: number = os.freemem();
    const usedMem: number = totalMem - freeMem;
    const memUsage: string = `${(usedMem / 1024 / 1024).toFixed(2)}MB`;
    const cpuLoad: number = os.loadavg()[0];
    const uptime: string = `${(os.uptime() / 3600).toFixed(2)}h`;
    const processMemUsage: string = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB';
    const techField = util.keyValueField({
      'RAM': `${(totalMem / 1024 / 1024).toFixed(2)}MB`,
      'Free': `${(freeMem / 1024 / 1024).toFixed(2)}MB`,
      'Used Total': memUsage,
      'Process Use': processMemUsage,
      'CPU Load': `${cpuLoad}%`,
      'System Uptime': uptime
    }, 25);
    const botField = util.keyValueField({
      'Client Version': pkg.version,
      'My Uptime': util.msToTimeString(i.client.uptime),
      'Server Count': util.commatize(i.client.guilds.cache.size),
      'Channel Count': util.commatize(i.client.channels.cache.size),
      'Unique Users': util.commatize(i.client.users.cache.size),
      'Emoji Count': util.commatize(i.client.emojis.cache.size)
    }, 25);
    const description: string = [
      `- **Linux Kernel** v${os.release()}`,
      `- **Node** ${process.version}`,
      `- **Discord.js** v${DiscordVersion}`,
      `- **CPU**: ${os.cpus()[0].model} \`[ ${os.cpus()[0].speed / 1000} GHz ]\``
    ].join("\n");
    const embed = this.embed
      .setAuthor({ name: "Raw Statistics", iconURL: i.client.user!.displayAvatarURL() })
      .setDescription(description)
      .setFooter({ text: "Probably a moron" })
      .addFields([
        { name: 'System', value: techField, inline: true },
        { name: 'Client', value: botField, inline: true }
      ]);

    (i.client as AokiClient).statsCache.set(i.user.id, { embed, timestamp: Date.now() });
    await i.editReply({ embeds: [embed] });
  };
};
