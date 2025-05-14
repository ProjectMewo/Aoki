import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Fortune extends Subcommand {
  constructor() {
    super({
      name: 'fortune',
      description: 'Get your daily fortune cookie.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // get the fortune cookie responses
    const cookies = await i.client.utils.profane.getStatic("fortune");
    // randomly select a fortune
    const cookie = i.client.utils.array.random(cookies);
    // send the response
    await i.reply({ content: cookie });
  };
}