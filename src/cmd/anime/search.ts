import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  TextGuildChannel,
  AutocompleteInteraction,
  Locales
} from "seyfert";
import { meta } from "@assets/cmdMeta";

const options = {
  type: createStringOption({
    description: 'content type to search for',
    description_localizations: meta.anime.search.type,
    required: true,
    choices: [
      { name: 'Anime', value: 'anime' },
      { name: 'Manga', value: 'manga' },
      { name: 'Characters', value: 'characters' },
      { name: 'People', value: 'people' }
    ]
  }),
  query: createStringOption({
    description: 'search query',
    description_localizations: meta.anime.search.query,
    required: true,
    autocomplete: async (interaction) => await Search.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: 'search',
  description: 'search for anime, manga, characters, or people on MyAnimeList'
})
@Locales(meta.anime.search.loc)
@Options(options)
export default class Search extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const type = interaction.options.getString("type")!;
    const focusedValue = interaction.options.getAutocompleteValue();
    const jikan_v4 = "https://api.jikan.moe/v4";

    if (!focusedValue) {
      return await interaction.respond([]);
    }

    try {
      const response = await fetch(`${jikan_v4}/${type}?q=${focusedValue}`);
      if (!response.ok) {
        return await interaction.respond([]);
      }

      const res = await response.json();
      if (!res.data || res.data.length === 0) {
        return await interaction.respond([]);
      }

      const nsfw = (interaction.channel as TextGuildChannel).nsfw;
      const results = res.data.filter((data: any) => {
        const name = data.title || data.name;
        return name.toLowerCase().includes(focusedValue.toLowerCase()) &&
          (nsfw || !data.rating || !["R-17"].includes(data.rating));
      });

      const limitedResults = results.slice(0, 25).map((data: any) => ({
        name: data.title || data.name,
        value: data.mal_id.toString()
      }));

      await interaction.respond(limitedResults);
    } catch {
      await interaction.respond([]);
    }
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.search;
    const { type, query } = ctx.options;
    const jikan_v4 = "https://api.jikan.moe/v4";
    const utils = ctx.client.utils;
    const channelNSFW = (ctx.interaction.channel as TextGuildChannel).nsfw;

    await ctx.deferReply();

    try {
      const jikanURL = `${jikan_v4}/${type}/${query}${['characters', 'people'].includes(type) ? "/full" : ""}`;
      const response = await fetch(jikanURL);

      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.apiError
        });
      }

      const res = await response.json();
      if (!res.data) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.notFound
        });
      }

      const data = res.data;

      if ((type === "anime" || type === "manga") &&
        data.rating &&
        ["R-17"].includes(data.rating) &&
        !channelNSFW) {
        return AokiError.NSFW({
          sender: ctx.interaction,
          content: t.noNsfw
        });
      }

      const embed = new Embed()
        .setColor(10800862)
        .setTimestamp()
        .setTitle(data.title || data.name)
        .setURL(data.url)
        .setThumbnail(data.images.jpg.small_image_url)
        .setDescription(
          type === "anime" || type === "manga"
            ? `**Description:** ${utils.string.textTruncate(data.synopsis, 750, `... *(read more [here](${data.url}))*`)}`
            : `**About:** ${utils.string.textTruncate(data.about || "No description available.", 500, `... *(read more [here](${data.url}))*`)}`
        );

      if (type === "anime" || type === "manga") {
        embed.addFields([
          { name: "Type", value: utils.string.toProperCase(data.type), inline: true },
          { name: "Status", value: utils.string.toProperCase(data.status), inline: true },
          { name: "Air Date", value: data[type === "anime" ? "aired" : "published"].string, inline: true },
          { name: "Avg. Rating", value: data.score?.toLocaleString() || "Unknown", inline: true },
          { name: "Age Rating", value: data.rating?.replace(")", "") || "Unknown", inline: true },
          { name: "Rating Rank", value: `#${data.rank?.toLocaleString() || "Unknown"}`, inline: true },
          { name: "Popularity", value: `#${data.popularity?.toLocaleString() || "Unknown"}`, inline: true }
        ]);
      }

      await ctx.editOrReply({ embeds: [embed] });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.undocErr
      });
    }
  }
}
