import AokiError from "@struct/AokiError";
import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
  name: 'advice',
  description: 'get a random piece of advice.'
})
export default class Advice extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    try {
      // fetch advice from the API
      const response = await fetch("https://api.adviceslip.com/advice");
      const data = await response.json();
      
      // extract the advice from the response
      const advice = data.slip.advice;
      
      // send the response
      await ctx.write({ content: advice });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "Failed to fetch advice. Try again later."
      });
    }
  }
}
