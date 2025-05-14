import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import AokiError from "@struct/handlers/AokiError";

export default class Banner extends Subcommand {
  constructor() {
    super({
      name: 'banner',
      description: 'get the banner of a user',
      permissions: [],
      options: [
        {
          type: 'user',
          name: 'user',
          description: 'the user to get the banner of',
          required: false
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const user = i.options.getUser("user") || i.user;
    
    // force fetch user
    const fetched = await user.fetch();
    const banner = fetched.banner;
    
    if (!banner) {
      return AokiError.GENERIC({
        sender: i,
        content: "They don't have Nitro as a user, or the developer hasn't configured a banner for that application."
      });
    }
    
    // handle different sizes
    const bannerURL = (s: 128 | 256 | 512 | 1024 | 2048) => user.bannerURL({
      extension: "png",
      size: s
    });
    
    const description = [
      `Quality: `,
      `[x128](${bannerURL(128)}) | `,
      `[x256](${bannerURL(256)}) | `,
      `[x512](${bannerURL(512)}) | `,
      `[x1024](${bannerURL(1024)}) | `,
      `[x2048](${bannerURL(2048)})`
    ].join("");
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: `${user.username}'s Banner` })
      .setDescription(description)
      .setImage(bannerURL(2048)!)
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}