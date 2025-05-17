import AokiError from "@struct/AokiError";
import Pagination from "@struct/Paginator";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed,
  SubCommand, 
  Options, 
  TextGuildChannel,
  LocalesT,
  AutocompleteInteraction
} from "seyfert";

const options = {
  day: createStringOption({
    description: 'day of the week',
    description_localizations: {
      "en-US": 'day of the week',
      "vi": 'ngày trong tuần'
    },
    required: true,
    autocomplete: async (i) => await Airing.prototype.autocomplete(i)
  })
};

@Declare({
  name: 'airing',
  description: 'get a list of anime airing on a specific day'
})
@LocalesT('anime.airing.name', 'anime.airing.description')
@Options(options)
export default class Airing extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.anime.airing.choices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.airing;
    const { day } = ctx.options;
    const channelNSFW = (ctx.interaction.channel as TextGuildChannel).nsfw;

    await ctx.deferReply();

    try {
      const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}${channelNSFW ? "" : "&sfw=true"}`);
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.apiError
        });
      }

      const res = await response.json();
      if (!res.data || res.data.length === 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.notFound
        });
      }

      const elapsed = Date.now() - ctx.interaction.createdTimestamp;
      const pages = res.data.map((data: any, index: number) => {
        const description = [
          `${data.score ? `**Score**: ${data.score}\n` : ''}`,
          `${data.genres.map((x: { name: string, url: string }) => 
            `[${x.name}](${x.url})`).join(' • ')}\n\n`,
          `${data.synopsis ? ctx.client.utils.string.textTruncate(data.synopsis, 300, `... *(read more [here](${data.url}))*`) : "*No synopsis available*"}`
        ].join("");

        const footer = [
          `Search duration: ${Math.abs(elapsed / 1000).toFixed(2)} seconds`,
          `Page ${index + 1} of ${res.data.length}`,
          `Data sent from MyAnimeList`
        ].join(" | ");

        const fields = [
          { name: 'Type', value: `${data.type || 'Unknown'}`, inline: true },
          { name: 'Started', value: `${new Date(data.aired.from).toISOString().substring(0, 10)}`, inline: true },
          { name: 'Source', value: `${data.source || 'Unknown'}`, inline: true },
          {
            name: 'Producers', value: `${data.producers.map((x: { name: string, url: string }) => 
              `[${x.name}](${x.url})`).join(' • ') || 'None'}`, inline: true
          },
          { name: 'Licensors', value: `${data.licensors.join(' • ') || 'None'}`, inline: true },
          { name: '\u200b', value: '\u200b', inline: true }
        ];

        return new Embed()
          .setColor(10800862)
          .setThumbnail(data.images.jpg.image_url)
          .setDescription(description)
          .setAuthor({ name: `${data.title}`, url: data.url })
          .setFooter({ text: footer, iconUrl: ctx.author.avatarURL() })
          .addFields(fields);
      });

      const paginator = new Pagination(pages);
      await paginator.handle({
        sender: ctx.interaction,
        filter: 'userOnly',
        time: 60000
      });
    } catch (error) {
      console.log(error);
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.undocErr
      });
    }
  }
}
