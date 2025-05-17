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
      // fetch advice from the API
      const fetch = await ctx.client.utils.profane.getStatic(
        "truth", 
        ctx.interaction.user.settings.language
      );

      const response = ctx.client.utils.array.random(fetch);
      
      // send the response
      await ctx.write({ content: response as string });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}