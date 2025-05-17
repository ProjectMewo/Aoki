import AokiError from "@struct/AokiError";
import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'advice',
  description: 'get a random piece of advice.'
})
@LocalesT('fun.advice.name', 'fun.advice.description')
export default class Advice extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.advice;
    try {
      // fetch advice from the API
      const fetch = await ctx.client.utils.profane.getStatic(
        "common", 
        ctx.interaction.user.settings.language
      );

      const response = ctx.client.utils.array.random(fetch.advice);
      
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
