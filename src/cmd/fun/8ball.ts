import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Eightball extends Subcommand {
  constructor() {
    super({
      name: '8ball',
      description: 'ask the magic 8-ball a question.',
      permissions: [],
      options: [{
        type: 'string',
        name: 'query',
        description: 'The question to ask the 8-ball',
        required: true
      }]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // get the question from the options
    const question = i.options.getString("query")!;
    // check if the question is profane
    if (await i.client.utils.profane.isProfane(question)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Fix your query, please. At least give me some respect!"
      });
    }
    // get the 8ball responses
    const eightball = await i.client.utils.profane.getStatic("8ball");
    // send the response
    await i.reply({ content: i.client.utils.array.random(eightball) });
  };
}