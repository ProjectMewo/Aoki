import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  Embed, 
  SubCommand 
} from "seyfert";

@Declare({
  name: 'quote',
  description: 'Get a random anime quote.'
})
export default class Quote extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    try {
      const response = await fetch(`https://waifu.it/api/v4/quote`, {
        headers: { 'Authorization': process.env.WAIFU_IT || "" }
      });

      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: "There was an error getting a quote. Try again later, or my sensei probably messed up."
        });
      }

      const data = await response.json();

      const embed = new Embed()
        .setColor(10800862)
        .setTitle("Random Anime Quote")
        .setDescription(`**${data.author}** from **${data.anime}**:\n\n*${data.quote}*`)
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "There was an error getting a quote. Try again later, or my sensei probably messed up."
      });
    }
  }
}