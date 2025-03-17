import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Invite extends Subcommand {
  constructor() {
    super({
      name: 'invite',
      description: 'take me to your server.',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const description: string = [
      "Hey, you want to take me to your server? Great. Let's make your server a little more lively.\n",
      `[Click here to take me there.](https://discord.com/oauth2/authorize?client_id=${i.client.user.id})`,
      "I'm quite exited to see what you have."
    ].join("\n");
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setDescription(description)
      .setTitle("Invite me?")
      .setThumbnail(i.client.user.avatarURL())
      .setFooter({ text: `Made with ❤` })
      .setTimestamp();
      
    await i.reply({ embeds: [embed] });
  }
}
