import AokiError from "@struct/AokiError";
import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
  name: 'affirmation',
  description: 'get a positive affirmation to brighten your day.'
})
export default class Affirmation extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    try {
      // Fetch data from the affirmation API
      const res = await fetch("https://www.affirmations.dev").then(res => res.json());
    
      // Extract the affirmation from the response
      const affirmation = res.affirmation;
    
      // Send the response
      await ctx.write({ content: affirmation });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "Failed to fetch an affirmation. Try again later."
      });
    }
  }
}
