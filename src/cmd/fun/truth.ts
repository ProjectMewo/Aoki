import AokiError from "@struct/AokiError";
import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
  name: 'truth',
  description: 'get a random truth question for truth or dare.'
})
@Locales({
  name: [
    ['en-US', 'truth'],
    ['vi', 'câu-hỏi-sự-thật']
  ],
  description: [
    ['en-US', 'get a random truth question for truth or dare.'],
    ['vi', 'nhận một câu hỏi sự thật ngẫu nhiên cho trò chơi thật hay dám.']
  ]
})
export default class Truth extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.truth;
    try {
      // fetch advice from the API
      const fetch = await ctx.client.utils.profane.getStatic(
        "truth", 
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