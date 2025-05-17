import AokiError from "@struct/AokiError";
import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'affirmation',
  description: 'get a positive affirmation to brighten your day.'
})
@LocalesT('fun.affirmation.name', 'fun.affirmation.description')
export default class Affirmation extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.affirmation;
    try {
      const fetch = await ctx.client.utils.profane.getStatic(
        "common", 
        ctx.interaction.user.settings.language
      );

      const response = ctx.client.utils.array.random(fetch.affirmation);
      
      await ctx.write({ content: response as string });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}
