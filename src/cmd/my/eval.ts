import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import AokiError from "@struct/handlers/AokiError";

export default class Eval extends Subcommand {
  constructor() {
    super({
      name: 'eval',
      description: 'evaluate javascript code (owner only)',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'the code to evaluate',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const query = i.options.getString("query")!;
    
    if (!i.client.config.owners.includes(i.user.id)) {
      return AokiError.PERMISSION({
        sender: i,
        content: 'Baka, you can\'t do that. This command is for my sensei.'
      });
    }
    
    try {
      // Defer reply as evaluation might take time
      await i.deferReply();
      
      // We often need to have the local context
      // instead of the global context of a safer approach
      // (0, eval)(query). This is a common practice in
      // Discord bots.
      const evaled = eval(query);
      const processedEval = typeof evaled !== 'string' 
        ? JSON.stringify(evaled, null, 2)
        : evaled;
    
      if (processedEval?.length > 1000) {
        await i.editReply({ content: "Output too big. Do this with `console.log()`." });
        return;
      }
    
      const embed = new EmbedBuilder()
        .setColor(10800862)
        .setTimestamp()
        .addFields([
          {
            name: "> Input",
            value: "```js\n" + query + "```"
          },
          {
            name: "> Output",
            value: "```js\n" + processedEval + "\n```"
          }
        ]);
    
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await i.editReply({ content: `Baka, you messed up.\n\`\`\`fix\n${error}\n\`\`\`` });
    }
  }
}