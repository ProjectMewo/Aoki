import AokiError from "@struct/AokiError";
import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
  name: 'fortune',
  description: 'Get your daily fortune cookie.'
})
export default class Fortune extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
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
        content: "Failed to fetch fortune. Try again later."
      });
    }
  }
}
