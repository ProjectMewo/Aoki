import AokiError from "@struct/AokiError";
import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'fact',
  description: 'get a random fact.'
})
@LocalesT('fun.fact.name', 'fun.fact.description')
export default class Fact extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.fact;
    try {
      // Define the URLs for facts
      const urls = ["https://catfact.ninja/fact", "https://uselessfacts.jsph.pl/random.json?language=en"];
      
      // Get a random URL from the array
      const randomUrl = ctx.client.utils.array.random(urls);
      
      // Fetch the data from the API
      const res = await fetch(randomUrl).then(res => res.json());
      
      // Extract the content (could be in .text or .fact property)
      const content = res.text || res.fact;
      
      // Send the response
      await ctx.write({ content });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}
