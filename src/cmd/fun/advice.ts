import AokiError from "@struct/AokiError";
import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
  name: 'advice',
  description: 'get a random piece of advice.'
})
@Locales({
  name: [
    ['en-US', 'advice'],
    ['vi', 'lời-khuyên']
  ],
  description: [
    ['en-US', 'get a random piece of advice.'],
    ['vi', 'nhận một lời khuyên ngẫu nhiên.']
  ]
})
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
