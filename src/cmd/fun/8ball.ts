import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'the question to ask the 8-ball',
    required: true
  })
}

@Declare({
  name: '8ball',
  description: 'ask the magic 8-ball a question.'
})
@Options(options)
export default class Eightball extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    // get the question from the options
    const question = ctx.options.query;
    
    // check if the question is profane
    if (await ctx.client.utils.profane.isProfane(question)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Fix your query, please. At least give me some respect!"
      });
    }
    
    // get the 8ball responses
    const eightball = await ctx.client.utils.profane.getStatic("8ball");
    
    // send the response
    await ctx.write({ content: ctx.client.utils.array.random(eightball) });
  }
}
