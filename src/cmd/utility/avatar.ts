import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Avatar extends Subcommand {
  constructor() {
    super({
      name: 'avatar',
      description: 'get the avatar of a user',
      permissions: [],
      options: [
        {
          type: 'user',
          name: 'user',
          description: 'the user to get the avatar of',
          required: false
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const user = i.options.getUser("user") || i.user;
    
    // handle different sizes
    const avatar = (s: 128 | 256 | 512 | 1024 | 2048) => user.avatarURL({
      extension: "png",
      size: s
    });
    
    const description = [
      `Quality: `,
      `[x128](${avatar(128)}) | `,
      `[x256](${avatar(256)}) | `,
      `[x512](${avatar(512)}) | `,
      `[x1024](${avatar(1024)}) | `,
      `[x2048](${avatar(2048)})`
    ].join("");
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: `${user.username}'s Avatar` })
      .setDescription(description)
      .setImage(avatar(2048))
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.reply({ embeds: [embed] });
  }
}