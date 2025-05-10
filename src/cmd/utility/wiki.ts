import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  TextGuildChannel
} from "seyfert";

const options = {
  query: createStringOption({
    description: 'the term to search for',
    required: true
  })
};

@Declare({
  name: 'wiki',
  description: 'search for information on Wikipedia'
})
@Options(options)
export default class Wiki extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { query } = ctx.options;

    await ctx.deferReply();

    if (await ctx.client.utils.profane.isProfane(query) && !(ctx.interaction.channel as TextGuildChannel).nsfw) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Your query contains profanity. Move to an NSFW channel or change the query."
      });
    }

    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`).then(res => res.json());

      if (!res?.title) {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: "Can't find that. Check your query."
        });
      }

      const timestamp = new Date(res.timestamp);
      const thumbnail = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png";

      const description = [
        `***Description:** ${res.description || "None"}*\n\n`,
        `**Extract:** ${ctx.client.utils.string.textTruncate(res.extract, 1000).split(". ").join(".\n- ")}`
      ].join("");

      const embed = new Embed()
        .setColor(10800862)
        .setTimestamp(timestamp)
        .setTitle(res.title)
        .setThumbnail(thumbnail)
        .setURL(res.content_urls.desktop.page)
        .setDescription(description)
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        });

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to fetch data from Wikipedia. Please try again later."
      });
    }
  }
}