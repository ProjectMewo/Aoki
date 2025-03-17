import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  AttachmentBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  TextChannel 
} from "discord.js";

export default class Screenshot extends Subcommand {
  constructor() {
    super({
      name: 'screenshot',
      description: 'take a screenshot of a website',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'the URL to take a screenshot of',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const query = i.options.getString("query")!;
    
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    
    if (!query.match(urlRegex)) {
      throw new Error("Baka, that's not a valid URL.\n\nMake sure it starts with either `https://` or `http://`.");
    }
    
    const nsfwPages = await i.client.utils.profane.getStatic("nsfw");
    
    if (nsfwPages.domains.includes(query) && !(i.channel as TextChannel).nsfw) {
      return AokiError.GENERIC({
        sender: i,
        content: "That's a NSFW website, you moron!"
      });
    }
    
    // take screenshot
    try {
      const url = [
        `https://api.screenshotone.com/take?`,
        `access_key=${process.env.SCREENSHOT_KEY}&`,
        `url=${query}&`,
        `format=jpg&`,
        `block_ads=true&`,
        `block_cookie_banners=true&`,
        `block_trackers=true&`,
        `timeout=10`
      ].join("");
      
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(new Uint8Array(buffer));
      const image = new AttachmentBuilder(imageBuffer, { name: "image.png" });
      
      const embed = new EmbedBuilder()
        .setColor(10800862)
        .setImage("attachment://image.png")
        .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
        .setTimestamp();
        
      await i.editReply({ embeds: [embed], files: [image] });
    } catch {
      return AokiError.GENERIC({
        sender: i,
        content: "Something's wrong with that URL. Check if you made a typo."
      });
    }
  }
}