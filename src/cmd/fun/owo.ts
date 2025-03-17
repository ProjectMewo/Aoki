import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Owo extends Subcommand {
  constructor() {
    super({
      name: 'owo',
      description: 'Convert your text to OwO speak.',
      permissions: [],
      options: [{
        type: 'string',
        name: 'query',
        description: 'The text to convert to OwO speak',
        required: true
      }]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // get the text from the options
    const text = i.options.getString("query")!;
    
    // fetch from the nekos.life API to convert text to owo
    const res = await fetch(`https://nekos.life/api/v2/owoify?text=${encodeURIComponent(text)}`).then(res => res.json());
    
    // send the response
    await i.reply({ content: res.owo });
  };
}