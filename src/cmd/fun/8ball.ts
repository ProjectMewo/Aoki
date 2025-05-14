import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  SubCommand, 
  Options, 
  LocalesT
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'the question to ask the 8-ball',
    description_localizations: {
      "en-US": 'the question to ask the 8-ball',
      "vi": 'câu hỏi bạn muốn hỏi quả cầu số 8'
    },
    required: true
  })
}

@Declare({
  name: '8ball',
  description: 'ask the magic 8-ball a question.'
})
@LocalesT('fun.8ball.name', 'fun.8ball.description')
@Options(options)
export default class Eightball extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun["8ball"];
    // get the question from the options
    const question = ctx.options.query;
    
    // check if the question is profane
    if (await ctx.client.utils.profane.isProfane(question)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noNsfw
      });
    }
    
    // get the 8ball responses
    const eightball = await ctx.client.utils.profane.getStatic("8ball");
    
    // send the response
    await ctx.write({ content: ctx.client.utils.array.random(eightball) });
  }
}
