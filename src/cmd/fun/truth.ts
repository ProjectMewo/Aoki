import AokiError from "@struct/AokiError";
import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'truth',
  description: 'get a random truth question for truth or dare.'
})
@LocalesT('fun.truth.name', 'fun.truth.description')
export default class Truth extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.truth;
    try {
      // Get the truth questions from static data
      const questions = await ctx.interaction.client.utils.profane.getStatic("truth");
      
      // Get a random question
      const question = ctx.interaction.client.utils.array.random(questions);
      
      // Send the response
      await ctx.write({ content: question });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}