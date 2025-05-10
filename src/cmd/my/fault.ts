import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createAttachmentOption, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  Attachment 
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'description of the issue',
    required: false
  }),
  attachment: createAttachmentOption({
    description: 'an image related to the issue',
    required: false
  })
};

@Declare({
  name: 'fault',
  description: 'report an issue with the bot'
})
@Options(options)
export default class Fault extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const query = ctx.options.query;
    const attachment = ctx.options.attachment;

    await ctx.deferReply();
    
    // handle exceptions
    if (!query && !attachment) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Baka, I can't send nothing. At least give me an error message, an image, or something!"
      });
    }
    
    // preset embed
    const preset = new Embed()
      .setColor(10800862)
      .setTitle(`New issue!`)
      .setThumbnail("https://i.imgur.com/1xMJ0Ew.png")
      .setFooter({ text: "Take care of these, I'm out", iconUrl: ctx.author.avatarURL() })
      .setDescription(`*Sent by **${ctx.author.username}***\n\n**Description:** ${query || "None"}\n**Image:** ${attachment ? "" : "None"}`)
      .setTimestamp();
    
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
      await ctx.editOrReply({ content: "I see you typing gibberish there, you baka." });
      await delay(3000);
      await ctx.editOrReply({ content: "You're not sending [these](https://i.imgur.com/C5tvxfp.png) through me, please." });
      await delay(3000);
      await ctx.editOrReply({ content: "I'll like [these](https://i.imgur.com/FRWBFXr.png) better." });
    };

    const isImageAttachment = (att: Attachment | null) => {
      return att?.contentType?.includes("image");
    };

    // Try to send to log channel if configured
    const sendToLogs = async (embed: Embed) => {
      try {
        const logChannelId = process.env.LOG_CHANNEL;
        if (!logChannelId) return;
        
        const channel = await ctx.client.channels.fetch(logChannelId);
        if (channel) {
          await ctx.client.messages.write(channel.id, { embeds: [embed] });
        }
      } catch (error) {
        console.error("Failed to send to logs:", error);
      }
    };

    // handle user query
    if (query && !attachment) {
      const gibberishCheck = await detectGibberish(query);
      if (gibberishCheck.noise > 0.5) {
        await sendErrorGibberish();
        return;
      } else {
        await ctx.editOrReply({ content: "Thank you for your feedback. The note will be resolved after a few working days." });
        await sendToLogs(preset);
        return;
      }
    } 
    
    // handle image attachment
    if (attachment) {
      if (!isImageAttachment(attachment)) {
        await ctx.editOrReply({ content: "Appreciate your attachment, but for now we only support images." });
        return;
      }
      
      preset.setImage(attachment.url);
      await ctx.editOrReply({ content: "Thank you for your feedback. The note will be resolved after a few working days." });
      await sendToLogs(preset);
      return;
    }
  }
}
