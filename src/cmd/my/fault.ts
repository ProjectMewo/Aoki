import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createAttachmentOption, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  Attachment, 
  LocalesT
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'description of the issue',
    description_localizations: {
      "en-US": 'description of the issue',
      "vi": 'mô tả vấn đề'
    },
    required: false
  }),
  attachment: createAttachmentOption({
    description: 'an image related to the issue',
    description_localizations: {
      "en-US": 'an image related to the issue',
      "vi": 'một hình ảnh liên quan đến vấn đề'
    },
    required: false
  })
};

@Declare({
  name: 'fault',
  description: 'report an issue with the bot'
})
@LocalesT('my.fault.name', 'my.fault.description')
@Options(options)
export default class Fault extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.fault;
    const query = ctx.options.query;
    const attachment = ctx.options.attachment;

    await ctx.deferReply();
    
    // handle exceptions
    if (!query && !attachment) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noInput
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
      await ctx.editOrReply({ content: t.gibberishDetected });
      await delay(3000);
      await ctx.editOrReply({ content: t.gibberishWarning1 });
      await delay(3000);
      await ctx.editOrReply({ content: t.gibberishWarning2 });
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
        await ctx.editOrReply({ content: t.thankYouFeedback });
        await sendToLogs(preset);
        return;
      }
    } 
    
    // handle image attachment
    if (attachment) {
      if (!isImageAttachment(attachment)) {
        await ctx.editOrReply({ content: t.nonImageAttachment });
        return;
      }
      
      preset.setImage(attachment.url);
      await ctx.editOrReply({ content: t.thankYouFeedback });
      await sendToLogs(preset);
      return;
    }
  }
}
