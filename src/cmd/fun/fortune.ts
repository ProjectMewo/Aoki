import AokiError from "@struct/AokiError";
import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'fortune',
  description: 'get your daily fortune cookie.'
})
@LocalesT('fun.fortune.name', 'fun.fortune.description')
export default class Fortune extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.fortune;
    try {
      // Get the fortune cookie responses
      const cookies = await ctx.client.utils.profane.getStatic("fortune");
      
      // Randomly select a fortune
      const cookie = ctx.client.utils.array.random(cookies);
      
      // Send the response
      await ctx.write({ content: cookie });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}
