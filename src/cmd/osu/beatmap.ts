import { Beatmapset } from "@local-types/beatmapset";
import AokiError from "@struct/AokiError";
import AokiClient from "@struct/Client";
import {
  CommandContext,
  createStringOption,
  createBooleanOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  TextGuildChannel,
  StringSelectMenu,
  StringSelectOption,
  ActionRow,
  StringSelectMenuInteraction,
  Button,
  Locales,
  AutocompleteInteraction
} from "seyfert";
import { ButtonStyle, MessageFlags } from "seyfert/lib/types";

const options = {
  query: createStringOption({
    description: "search query for the beatmap",
    description_localizations: {
      "en-US": "search query for the beatmap",
      "vi": "truy vấn tìm kiếm cho beatmap"
    },
    required: true
  }),
  mode: createStringOption({
    description: "filter by game mode",
    description_localizations: {
      "en-US": "filter by game mode",
      "vi": "lọc theo chế độ chơi"
    },
    required: false,
    choices: [
      { name: "osu!standard", value: "0" },
      { name: "osu!taiko", value: "1" },
      { name: "osu!catch", value: "2" },
      { name: "osu!mania", value: "3" }
    ]
  }),
  status: createStringOption({
    description: "filter by ranked status",
    description_localizations: {
      "en-US": "filter by ranked status",
      "vi": "lọc theo trạng thái xếp hạng"
    },
    required: false,
    autocomplete: async (interaction) => await Beatmap.prototype.autocompleteStatus(interaction)
  }),
  sort: createStringOption({
    description: "sort the results",
    description_localizations: {
      "en-US": "sort the results",
      "vi": "sắp xếp kết quả"
    },
    required: false,
    autocomplete: async (interaction) => await Beatmap.prototype.autocompleteSort(interaction)
  }),
  genre: createStringOption({
    description: "filter by music genre",
    description_localizations: {
      "en-US": "filter by music genre",
      "vi": "lọc theo thể loại nhạc"
    },
    required: false,
    autocomplete: async (interaction) => await Beatmap.prototype.autocompleteGenre(interaction)
  }),
  language: createStringOption({
    description: "filter by language",
    description_localizations: {
      "en-US": "filter by language",
      "vi": "lọc theo ngôn ngữ"
    },
    required: false,
    autocomplete: async (interaction) => await Beatmap.prototype.autocompleteLanguage(interaction)
  }),
  storyboard: createBooleanOption({
    description: "filter maps with storyboards",
    description_localizations: {
      "en-US": "filter maps with storyboards",
      "vi": "lọc các map có storyboard"
    },
    required: false
  })
};

@Declare({
  name: "beatmap",
  description: "search for beatmaps by query"
})
@Locales({
  name: [
    ['en-US', 'beatmap'],
    ['vi', 'tìm-map']
  ],
  description: [
    ['en-US', 'search for beatmaps by query'],
    ['vi', 'tìm kiếm beatmap bằng truy vấn']
  ]
})
@Options(options)
export default class Beatmap extends SubCommand {
  private readonly api_v2 = "https://osu.ppy.sh/api/v2";

  async autocompleteStatus(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction, 
      interaction.t.osu.beatmap.choices.status
    );
  }

  async autocompleteSort(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.beatmap.choices.sort
    );
  }

  async autocompleteGenre(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.beatmap.choices.genre
    );
  }

  async autocompleteLanguage(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.beatmap.choices.langs
    );
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.beatmap;
    const {
      query,
      mode = "0",
      status = "any",
      sort = "relevance",
      genre = "any",
      language = "any",
      storyboard = false
    } = ctx.options;
    const utils = ctx.client.utils;

    await ctx.deferReply();

    try {
      const searchParams = {
        query,
        m: mode,
        status,
        genre,
        language,
        sort,
        storyboard: storyboard ? "1" : "0"
      };

      const beatmapsets = await this.searchBeatmap({
        client: ctx.client,
        type: "beatmaps",
        ...searchParams
      }) as Array<Beatmapset>;

      if (beatmapsets.length == 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.noResults
        });
      }

      // NSFW filtering
      const beatmapsFiltered = beatmapsets.filter((beatmap: Beatmapset) => {
        if ((ctx.interaction.channel as TextGuildChannel).nsfw) return true;
        else return !beatmap.nsfw;
      });

      if (beatmapsFiltered.length == 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.nsfwResults
        });
      }

      // Take only 25 first results
      const beatmaps = beatmapsFiltered.slice(0, 25);
      const options = beatmaps.map((beatmap: Beatmapset, index: number) => (
        new StringSelectOption({
          label: `${beatmap.artist} - ${beatmap.title}`,
          description: t.stringSelectDesc(beatmap.creator, beatmap.status),
          value: index.toString()
        })
      ));

      const selectMenu = new StringSelectMenu()
        .setCustomId('beatmap_select')
        .setPlaceholder(t.selectPlaceholder(beatmaps.length))
        .addOption(options);

      const row = new ActionRow<StringSelectMenu>().addComponents(selectMenu);

      const message = await ctx.editOrReply({ components: [row] }, true);

      // Filter for the select menu interaction
      const filter = (interaction: any): interaction is StringSelectMenuInteraction => {
        return interaction.user.id === ctx.author.id;
      };

      const collector = message.createComponentCollector({ filter, timeout: 90000 }); // 2 minutes

      collector.run('beatmap_select', async (interaction: StringSelectMenuInteraction) => {
        const selectedIndex = parseInt(interaction.values[0]);
        const selectedBeatmap = beatmaps[selectedIndex];

        const detailedEmbed = new Embed()
          .setColor(10800862)
          .setAuthor({
            name: t.embed.author(selectedBeatmap.creator),
            iconUrl: `https://a.ppy.sh/${selectedBeatmap.user_id}`
          })
          .setDescription(t.embed.description(selectedBeatmap.id))
          .setTitle(`${utils.string.escapeMarkdown(selectedBeatmap.artist)} - ${utils.string.escapeMarkdown(selectedBeatmap.title)}`)
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}`)
          .setImage(`https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/cover.jpg`)
          .addFields(
            { name: t.embed.fieldNames.rawT, value: `${utils.string.escapeMarkdown(selectedBeatmap.artist_unicode)} - ${utils.string.escapeMarkdown(selectedBeatmap.title_unicode)}`, inline: false },
            { name: t.embed.fieldNames.source, value: selectedBeatmap.source || "None", inline: false },
            { name: t.embed.fieldNames.bpm, value: selectedBeatmap.bpm.toString(), inline: true },
            { name: t.embed.fieldNames.favs, value: selectedBeatmap.favourite_count.toString(), inline: true },
            { name: t.embed.fieldNames.spotStats, value: utils.string.toProperCase(selectedBeatmap.spotlight.toString()), inline: true },
            { name: t.embed.fieldNames.setId, value: selectedBeatmap.id.toString(), inline: true },
            { name: t.embed.fieldNames.nsfw, value: utils.string.toProperCase(selectedBeatmap.nsfw.toString()), inline: true },
            { name: t.embed.fieldNames.updated, value: utils.time.formatDistance(new Date(selectedBeatmap.last_updated), new Date()), inline: true },
            { name: t.embed.fieldNames.status, value: `${utils.string.toProperCase(selectedBeatmap.status)}${selectedBeatmap.ranked_date ? ` ${t.embed.fieldNames.on} ${utils.time.formatDate(new Date(selectedBeatmap.ranked_date), "ddMMMMyyyy")}` : ""}`, inline: false },
          )
          .setFooter({ text: t.embed.footer(selectedBeatmap.beatmaps.length, selectedBeatmap.status) })
          .setTimestamp();

        const downloadButton = new Button()
          .setLabel(t.buttons.osuWebDownload)
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}/download`)
          .setStyle(ButtonStyle.Link);

        const directButton = new Button()
          .setLabel(t.buttons.osuDirectDownload)
          .setURL(`https://aoki.mewo.workers.dev/osu/direct?id=${selectedBeatmap.beatmaps[0].id}`)
          .setStyle(ButtonStyle.Link);

        const buttonRow = new ActionRow<Button>()
          .addComponents(downloadButton, directButton);

        await interaction.editOrReply({ embeds: [detailedEmbed], components: [buttonRow], flags: MessageFlags.Ephemeral });
      });

    } catch (error) {
      console.error('Error searching for beatmaps:', error);
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }

  // API helper methods
  async searchBeatmap(params: any) {
    const token = await (params.client as AokiClient).requestV2Token();

    // Build URL with query parameters
    const query = Object.entries(params)
      .filter(([key, value]) => key !== 'type' && value !== 'any')
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join('&');

    const url = `${this.api_v2}/beatmapsets/search?${query}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    return data.beatmapsets;
  }
}