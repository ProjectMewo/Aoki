import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  Attachment,
  ChatInputCommandInteraction, 
  EmbedBuilder 
} from "discord.js";
import AokiError from "@struct/handlers/AokiError";

export default class Fault extends Subcommand {
  constructor() {
    super({
      name: 'fault',
      description: 'report an issue with the bot',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'description of the issue',
          required: false
        },
        {
          type: 'attachment',
          name: 'attachment',
          description: 'an image related to the issue',
          required: false
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const query = i.options.getString("query");
    const attachment = i.options.getAttachment("attachment");

    await i.deferReply();
    
    // handle exceptions
    if (!query && !attachment) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Baka, I can't send nothing. At least give me an error message, an image, or something!"
      });
    }
    
    // preset embed
    const preset = new EmbedBuilder()
      .setColor(10800862)
      .setTitle(`New issue!`)
      .setThumbnail("https://i.imgur.com/1xMJ0Ew.png")
      .setFooter({ text: "Take care of these, I'm out", iconURL: i.user.displayAvatarURL() })
      .setDescription(`*Sent by **${i.user.username}***\n\n**Description:** ${query || "None"}\n**Image:** ${attachment ? "" : "None"}`)
      .setTimestamp();
    
    // Defer the reply since this might take some time
    await i.deferReply();
    
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

    const sendErrorGibberish = async () => {
      await i.editReply({ content: "I see you typing gibberish there, you baka." });
      await delay(3000);
      await i.editReply({ content: "You're not sending [these](https://i.imgur.com/C5tvxfp.png) through me, please." });
      await delay(3000);
      await i.editReply({ content: "I'll like [these](https://i.imgur.com/FRWBFXr.png) better." });
    };

    const isImageAttachment = (att: Attachment | null) => {
      return att?.contentType?.includes("image");
    };

    const sendToLogs = async (embed: EmbedBuilder) => {
      const channel = i.client.channels.cache.get(i.client.config.logChannel);
      if (!channel || !('send' in channel)) return;
      return await channel.send({ embeds: [embed] });
    };

    // handle user query
    if (query && !attachment) {
      const gibberishCheck = await detectGibberish(query);
      if (gibberishCheck.noise > 0.5) {
        await sendErrorGibberish();
        return;
      } else {
        await i.editReply({ content: "Thank you for your feedback. The note will be resolved after a few working days." });
        await sendToLogs(preset);
        return;
      }
    } else if (attachment) {
      if (!isImageAttachment(attachment)) {
        return AokiError.USER_INPUT({
          sender: i,
          content: "Appreciate your attachment, but for now we only support images."
        });
      }
      preset.setImage(attachment.url);
      await i.editReply({ content: "Thank you for your feedback. The note will be resolved after a few working days." });
      await sendToLogs(preset);
      return;
    }
  }
}