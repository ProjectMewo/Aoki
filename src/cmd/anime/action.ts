import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Action extends Subcommand {
  constructor() {
    super({
      name: 'action',
      description: 'Get a random anime action image',
      permissions: [],
      options: [{
        type: 'string',
        name: 'type',
        description: 'The type of action to get',
        required: true,
        choices: [
          { name: 'waifu', value: 'waifu' },
          { name: 'neko', value: 'neko' },
          { name: 'shinobu', value: 'shinobu' },
          { name: 'megumin', value: 'megumin' },
          { name: 'bully', value: 'bully' },
          { name: 'cuddle', value: 'cuddle' },
          { name: 'cry', value: 'cry' },
          { name: 'hug', value: 'hug' },
          { name: 'awoo', value: 'awoo' },
          { name: 'kiss', value: 'kiss' },
          { name: 'lick', value: 'lick' },
          { name: 'pat', value: 'pat' },
          { name: 'smug', value: 'smug' },
          { name: 'bonk', value: 'bonk' },
          { name: 'yeet', value: 'yeet' },
          { name: 'blush', value: 'blush' },
          { name: 'smile', value: 'smile' },
          { name: 'wave', value: 'wave' },
          { name: 'highfive', value: 'highfive' },
          { name: 'handhold', value: 'handhold' },
          { name: 'nom', value: 'nom' },
          { name: 'bite', value: 'bite' },
          { name: 'glomp', value: 'glomp' },
          { name: 'slap', value: 'slap' },
          { name: 'kick', value: 'kick' }
        ]
      }]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    // Get the action type from options
    const actionType = i.options.getString("type")!;
    
    try {
      const response = await fetch(`https://waifu.pics/api/sfw/${actionType}`);
      
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: i,
          content: "There was an error getting that image. Try again later, or my sensei probably messed up."
        });
      }
      
      const data = await response.json();
      
      // Create embedded image response
      const embed = new EmbedBuilder()
        .setColor(10800862)
        .setImage(data.url)
        .setTimestamp();
      
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "There was an error getting that image. Try again later, or my sensei probably messed up."
      });
    }
  };
}