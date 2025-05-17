import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  LocalesT, 
  SubCommand 
} from "seyfert";

@Declare({
  name: 'quote',
  description: 'get a random anime quote.'
})
@LocalesT('anime.quote.name', 'anime.quote.description')
export default class Quote extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.quote;
    await ctx.deferReply();

    try {
      const response = await fetch(`https://waifu.it/api/v4/quote`, {
        headers: { 'Authorization': process.env.WAIFU_IT || "" }
      });

      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.apiError
        });
      }

      const data = await response.json();

      await ctx.editOrReply({ 
        content: `**${data.author}** from **${data.anime}**:\n\n*${data.quote}*` 
      });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}