import AokiError from "@struct/AokiError";
import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
  name: 'fortune',
  description: 'get your daily fortune cookie.'
})
@Locales({
  name: [
    ['en-US', 'fortune'],
    ['vi', 'bánh-quy-may-mắn']
  ],
  description: [
    ['en-US', 'get your daily fortune cookie.'],
    ['vi', 'nhận bánh quy may mắn hàng ngày của cậu.']
  ]
})
export default class Fortune extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.fortune;
    try {
      const fetch = await ctx.client.utils.profane.getStatic(
        "fortune", 
        ctx.interaction.user.settings.language
      );

      const response = ctx.client.utils.array.random(fetch);
      
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
