import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Info extends Subcommand {
  constructor() {
    super({
      name: 'info',
      description: 'get information about me',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // construct message parts
    const description: string = [
      "Oh, it's you? Hey, I'm **Aoki**. It only means a mere blue tree, but sensei (`shimeji.rin`, by the way) can't do anything about it, unfortunately.\n",
      "Everyone calls me a tsundere. Even my sensei does that on my [Github](https://github.com/ProjectMewo/Aoki) - yes, I'm **open-source**, and documented. But I don't think I am one, it's just because *I occasionally slap people*, sorry."
    ].join("\n");
    
    const fields: { name: string, value: string }[] = [
      {
        name: "What can you do?",
        value: "Probably providing advanced anime information and some little utilities so you don't have to open a browser."
      },
      {
        name: "Why isn't there a help command?",
        value: "I have written descriptions for them, they're slash commands. Just follow them to get what you want, *sigh*. I'm busy, I don't have time to write those."
      },
      {
        name: "How can I take you to my server?",
        value: "Oh, you want me in your server? Great. [Click here to take me there.](https://discord.com/oauth2/authorize?client_id=898267773755947018&permissions=8&scope=applications.commands%20bot)\nI'm quite exited to see what you have."
      }
    ];
    
    // construct embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setDescription(description)
      .addFields(fields)
      .setTitle("/my info")
      .setThumbnail("https://i.imgur.com/Nar1fRE.png")
      .setFooter({ text: `Made with ❤` })
      .setTimestamp();
      
    // send
    await i.reply({ embeds: [embed] });
  }
}