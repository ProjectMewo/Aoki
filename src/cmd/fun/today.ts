import AokiError from "@struct/AokiError";
import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
  name: 'today',
  description: 'get a historical event that happened on today\'s date.'
})
export default class Today extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    try {
      // Get current date
      const [month, day] = new Date().toLocaleDateString().trim().split("/");

      // Fetch historical data
      const todayRes = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
      if (!todayRes.ok) {
        throw new Error(`Failed to fetch historical data: ${todayRes.status}`);
      }

      const todayJs = await todayRes.json() as { data: { Events: Array<{ text: string; year: string }> }, date: string };

      // Get random event
      const { text, year } = ctx.client.utils.array.random(todayJs.data.Events);

      // Send response
      await ctx.write({ content: `On **${todayJs.date}, ${year}**: ${text}` });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "Failed to fetch historical data. Try again later."
      });
    }
  }
}