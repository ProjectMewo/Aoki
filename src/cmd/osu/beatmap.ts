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
  Button
} from "seyfert";
import { ButtonStyle, MessageFlags } from "seyfert/lib/types";

const options = {
  query: createStringOption({
    description: "search query for the beatmap",
    required: true
  }),
  mode: createStringOption({
    description: "filter by game mode",
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
    required: false,
    choices: [
      { name: "Ranked", value: "ranked" },
      { name: "Qualified", value: "qualified" },
      { name: "Loved", value: "loved" },
      { name: "Pending", value: "pending" },
      { name: "Graveyard", value: "graveyard" },
      { name: "Any", value: "any" }
    ]
  }),
  sort: createStringOption({
    description: "sort the results",
    required: false,
    choices: [
      { name: "Relevance", value: "relevance" },
      { name: "Date (newest)", value: "plays" },
      { name: "Difficulty", value: "difficulty" }
    ]
  }),
  genre: createStringOption({
    description: "filter by music genre",
    required: false,
    choices: [
      { name: "Any", value: "any" },
      { name: "Unspecified", value: "unspecified" },
      { name: "Video Game", value: "video-game" },
      { name: "Anime", value: "anime" },
      { name: "Rock", value: "rock" },
      { name: "Pop", value: "pop" },
      { name: "Other", value: "other" },
      { name: "Novelty", value: "novelty" },
      { name: "Hip Hop", value: "hip-hop" },
      { name: "Electronic", value: "electronic" },
      { name: "Metal", value: "metal" },
      { name: "Classical", value: "classical" },
      { name: "Folk", value: "folk" },
      { name: "Jazz", value: "jazz" }
    ]
  }),
  language: createStringOption({
    description: "filter by language",
    required: false,
    choices: [
      { name: "Any", value: "any" },
      { name: "Other", value: "other" },
      { name: "English", value: "english" },
      { name: "Japanese", value: "japanese" },
      { name: "Chinese", value: "chinese" },
      { name: "Instrumental", value: "instrumental" },
      { name: "Korean", value: "korean" },
      { name: "French", value: "french" },
      { name: "German", value: "german" },
      { name: "Swedish", value: "swedish" },
      { name: "Spanish", value: "spanish" },
      { name: "Italian", value: "italian" }
    ]
  }),
  storyboard: createBooleanOption({
    description: "filter maps with storyboards",
    required: false
  })
};

@Declare({
  name: "beatmap",
  description: "search for beatmaps by query"
})
@Options(options)
export default class Beatmap extends SubCommand {
  private readonly api_v2 = "https://osu.ppy.sh/api/v2";

  async run(ctx: CommandContext<typeof options>): Promise<void> {
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
          content: "No beatmaps found matching your criteria."
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
          content: "Baka, all of the results I found were NSFW. Be more cultured."
        });
      }

      // Take only 25 first results
      const beatmaps = beatmapsFiltered.slice(0, 25);
      const options = beatmaps.map((beatmap: Beatmapset, index: number) => (
        new StringSelectOption({
          label: `${beatmap.artist} - ${beatmap.title}`,
          description: `Mapper: ${beatmap.creator} | Status: ${utils.string.toProperCase(beatmap.status)}`,
          value: index.toString()
        })
      ));

      const selectMenu = new StringSelectMenu()
        .setCustomId('beatmap_select')
        .setPlaceholder(`Listing ${beatmaps.length} top result${beatmaps.length == 1 ? "" : "s"}. Select to view.`)
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
            name: `Mapped by ${selectedBeatmap.creator}`,
            iconUrl: `https://a.ppy.sh/${selectedBeatmap.user_id}`
          })
          .setDescription(`:notes: [Song preview](https://b.ppy.sh/preview/${selectedBeatmap.id}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/raw.jpg)`)
          .setTitle(`${utils.string.escapeMarkdown(selectedBeatmap.artist)} - ${utils.string.escapeMarkdown(selectedBeatmap.title)}`)
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}`)
          .setImage(`https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/cover.jpg`)
          .addFields(
            { name: "Raw Title", value: `${utils.string.escapeMarkdown(selectedBeatmap.artist_unicode)} - ${utils.string.escapeMarkdown(selectedBeatmap.title_unicode)}`, inline: false },
            { name: "Source", value: selectedBeatmap.source || "None", inline: false },
            { name: "BPM", value: selectedBeatmap.bpm.toString(), inline: true },
            { name: "Favorites", value: selectedBeatmap.favourite_count.toString(), inline: true },
            { name: "Spotlight Status", value: utils.string.toProperCase(selectedBeatmap.spotlight.toString()), inline: true },
            { name: "Set ID", value: selectedBeatmap.id.toString(), inline: true },
            { name: "Is NSFW?", value: utils.string.toProperCase(selectedBeatmap.nsfw.toString()), inline: true },
            { name: "Last updated", value: utils.time.formatDistance(new Date(selectedBeatmap.last_updated), new Date()), inline: true },
            { name: "Status", value: `${utils.string.toProperCase(selectedBeatmap.status)}${selectedBeatmap.ranked_date ? ` on ${utils.time.formatDate(new Date(selectedBeatmap.ranked_date), "ddMMMMyyyy")}` : ""}`, inline: false },
          )
          .setFooter({ text: `This set has ${selectedBeatmap.beatmaps.length} ${selectedBeatmap.status} beatmaps` })
          .setTimestamp();

        const downloadButton = new Button()
          .setLabel('osu!web download')
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}/download`)
          .setStyle(ButtonStyle.Link);

        const directButton = new Button()
          .setLabel('osu!direct download')
          .setURL(`https://aoki.hackers.moe/osu/direct?id=${selectedBeatmap.beatmaps[0].id}`)
          .setStyle(ButtonStyle.Link);

        const buttonRow = new ActionRow<Button>()
          .addComponents(downloadButton, directButton);

        await interaction.editOrReply({ embeds: [detailedEmbed], components: [buttonRow], flags: MessageFlags.Ephemeral });
      });

    } catch (error) {
      console.error('Error searching for beatmaps:', error);
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: 'An error occurred while searching for beatmaps. Please try again later.'
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