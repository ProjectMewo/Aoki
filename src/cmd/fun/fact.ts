import AokiError from "@struct/AokiError";
import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
  name: 'fact',
  description: 'get a random fact.'
})
@Locales({
  name: [
    ['en-US', 'fact'],
    ['vi', 'sự-thật']
  ],
  description: [
    ['en-US', 'get a random fact.'],
    ['vi', 'lấy một sự thật ngẫu nhiên.']
  ]
})
export default class Fact extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.fact;
    try {
      const fetch = await ctx.client.utils.profane.getStatic(
        "common", 
        ctx.interaction.user.settings.language
      );

      const response = ctx.client.utils.array.random([
        ...fetch.uselessfact,
        ...fetch.catfact
      ]);
      
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
