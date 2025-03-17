import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Truth extends Subcommand {
  constructor() {
    super({
      name: 'truth',
      description: 'get a random truth question for truth or dare.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // get the truth questions from static data
    const questions = await i.client.utils.profane.getStatic("truth");
    // get a random question
    const question = i.client.utils.array.random(questions);
    // send the response
    await i.reply({ content: question });
  };
}