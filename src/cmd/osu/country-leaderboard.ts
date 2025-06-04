import {
  CommandContext,
  createStringOption,
  createNumberOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  Locales,
  AutocompleteInteraction
} from "seyfert";
import AokiError from "@struct/AokiError";
import AokiClient from "@struct/Client";
import Pagination from "@struct/Paginator";
import { meta } from "@assets/cmdMeta";

const options = {
  beatmap_id: createNumberOption({
    description: "the beatmap ID to check",
    description_localizations: meta.osu.country_leaderboard.beatmap_id,
    required: true
  }),
  country_code: createStringOption({
    description: "the country code (2 letters)",
    description_localizations: meta.osu.country_leaderboard.country_code,
    required: true
  }),
  mode: createStringOption({
    description: "the game mode to check",
    description_localizations: meta.osu.country_leaderboard.mode,
    required: true,
    choices: [
      { name: "osu!standard", value: "osu" },
      { name: "osu!taiko", value: "taiko" },
      { name: "osu!catch", value: "fruits" },
      { name: "osu!mania", value: "mania" }
    ]
  }),
  sort: createStringOption({
    description: "how to sort the results",
    description_localizations: meta.osu.country_leaderboard.sort,
    required: false,
    autocomplete: async (interaction) => await CountryLeaderboard.prototype.autocompleteSort(interaction)
  })
};

@Declare({
  name: "country-leaderboard",
  description: "get a country leaderboard for a specific beatmap"
})
@Locales(meta.osu.country_leaderboard.loc)
@Options(options)
export default class CountryLeaderboard extends SubCommand {
  private readonly api_v1 = "https://osu.ppy.sh/api/";
  private readonly api_v2 = "https://osu.ppy.sh/api/v2";

  async autocompleteSort(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.countryLb.choices.sort
    )
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.countryLb;
    await ctx.deferReply();
    const { beatmap_id, country_code, mode, sort } = ctx.options;

    const sortingMap = {
      performance: 0,
      lazer_score: 1,
      stable_score: 2,
      combo: 3,
      accuracy: 4,
    };

    const sorting = sortingMap[sort as keyof typeof sortingMap] ?? 0;

    if (country_code.length !== 2) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidCountryCode
      });
    }

    try {
      // Concurrently fetch the first 2 pages of country leaderboard
      const [page1, page2] = await Promise.all([
        this.fetchRankingList({ client: ctx.client as AokiClient, type: "performance", country_code: country_code, mode }),
        this.fetchRankingList({ client: ctx.client as AokiClient, type: "performance", country_code: country_code, mode, page: 2 }),
      ]);

      const rankings = [...page1.ranking, ...page2.ranking];
      if (!rankings.length) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.noPlayersFound(country_code)
        });
      }

      const userIds = rankings.map(player => player.user.id);
      const countryScores = [];
      const chunkSize = 20;

      // Use chunks to process these data
      for (let j = 0; j < userIds.length; j += chunkSize) {
        const chunk = userIds.slice(j, j + chunkSize);
        const results = await Promise.allSettled(chunk.map(userId =>
          this.listAllUserScores({
            client: ctx.client as AokiClient,
            type: "user_beatmap_all",
            user_id: userId,
            beatmap_id: beatmap_id,
            mode,
            include_fails: 0,
            limit: 1,
          })
        ));
        for (const res of results) {
          if (res.status === 'fulfilled' && res.value && res.value.length)
            countryScores.push(res.value[0]);
        }
      }

      if (!countryScores.length) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.noScoresFound(country_code)
        });
      }

      // Sort by metric chosen by user
      countryScores.sort((a, b) => {
        const comparators = [
          () => b.pp - a.pp,
          () => b.total_score - a.total_score,
          () => b.legacy_total_score - a.legacy_total_score,
          () => b.max_combo - a.max_combo,
          () => b.accuracy - a.accuracy,
        ];
        return comparators[sorting]();
      });

      const scoresPerPage = 5;
      const totalPages = Math.ceil(countryScores.length / scoresPerPage);
      const beatmapDetails = await this.fetchBeatmapDetails({ client: ctx.client as AokiClient, type: "difficulty", id: beatmap_id });
      const beatmapTitle = `${beatmapDetails.beatmapset.artist} - ${beatmapDetails.beatmapset.title} [${beatmapDetails.version}]`;
      const pages = new Pagination();

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageScores = countryScores.slice(pageIndex * scoresPerPage, (pageIndex + 1) * scoresPerPage);
        const scoreLines = await Promise.all(pageScores.map(async (score, idx) => {
          const user = await this.findUserById(score.user_id, { type: "id" });
          const rankEmote = ctx.client.utils.osu.rankEmotes[score.rank] || score.rank;
          const stats = score.statistics;

          let statsString = '';
          if (mode === 'osu') statsString = `${stats.great || "0"}/${stats.ok || "0"}/${stats.meh || "0"}/${stats.miss || "0"}`;
          if (mode === 'taiko') statsString = `${stats.great || "0"}/${stats.ok || "0"}/${stats.miss || "0"}`;
          if (mode === 'fruits') statsString = `${stats.great || "0"}/${stats.large_tick_hit || "0"}/${stats.small_tick_hit || "0"}/${stats.miss || "0"}`;
          if (mode === 'mania') statsString = `${stats.perfect || "0"}/${stats.great || "0"}/${stats.good || "0"}/${stats.ok || "0"}/${stats.meh || "0"}/${stats.miss || "0"}`;

          const displayedScore = sorting === 2 ? score.legacy_total_score : score.total_score;
          return [
            `**${pageIndex * scoresPerPage + idx + 1}) ${user.username}**`,
            `▸ ${rankEmote} ▸ **${Number(score.pp).toFixed(2)}pp** ▸ ${(score.accuracy * 100).toFixed(2)}%`,
            `▸ ${displayedScore.toLocaleString()} ▸ x${score.max_combo}/${beatmapDetails.max_combo} ▸ [${statsString}]`,
            `▸ \`+${score.mods.map((mod: { acronym: string }) => mod.acronym).join("") || 'NM'}\` ▸ ${t.scoreSet} ||${ctx.client.utils.time.formatDistance(new Date(score.ended_at), new Date())}||`
          ].join('\n');
        }));

        const sortString = t.sortingOptions[sorting];
        const embed = new Embed()
          .setTitle(beatmapTitle)
          .setURL(`https://osu.ppy.sh/b/${beatmap_id}`)
          .setAuthor({ name: t.embed.author, iconUrl: `https://osu.ppy.sh/images/flags/${country_code}.png` })
          .setDescription(`${t.embed.description(beatmapDetails.beatmapset_id)}\n\n` + scoreLines.join('\n\n'))
          .setFooter({ text: t.embed.footer(sortString, pageIndex, totalPages) })
          .setTimestamp()
          .setImage(`https://assets.ppy.sh/beatmaps/${beatmapDetails.beatmapset_id}/covers/cover.jpg`)
          .setColor(10800862);

        pages.add(embed);
      }

      pages.handle({
        sender: ctx.interaction,
        filter: 'userOnly',
        time: 90000
      });

      return;
    } catch (error) {
      console.error('Error fetching country leaderboard:', error);
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }

  // API helper methods
  async findUserById(userId: string, options: { type: string }) {
    const params = new URLSearchParams({
      k: process.env["OSU_KEY"] || "",
      u: userId.toString(),
      type: options.type
    });

    const url = `${this.api_v1}/get_user?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();

    return data[0] || null;
  }

  async fetchRankingList({ client, type, country_code, mode, page = 1 }: { client: AokiClient, type: string, country_code: string, mode: string, page?: number }) {
    const token = await client.requestV2Token();
    const url = `${this.api_v2}/rankings/${mode}/${type}?country=${country_code}&cursor[page]=${page}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return await res.json();
  }

  async listAllUserScores({ client, type, user_id, beatmap_id, mode, include_fails, limit }: { client: AokiClient, type: string, user_id: string, beatmap_id: number, mode: string, include_fails: number, limit: number }) {
    const token = await client.requestV2Token();
    const url = [
      `${this.api_v2}/beatmaps/${beatmap_id}`, // beatmap path
      `/scores/users/${user_id}/all`, // all user scores on beatmap
      `?mode=${mode}`, // the gamemode of the play (for converts)
      `&type=${type}`, // the type of score to fetch
      `&include_fails=${include_fails}`, // whether to include failed scores
      `&limit=${limit}` // the number of scores to fetch
    ].join("");

    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "x-api-version": "20240130" // api version has to precisely be this in order to have the legacy score fields
      }
    });

    const responses = await res.json();
    return responses.scores;
  }

  async fetchBeatmapDetails({ client, type, id }: { client: AokiClient, type: string, id: number }) {
    const token = await client.requestV2Token();
    const url = `${this.api_v2}/beatmaps/${id}?type=${type}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "x-api-version": "20240130" }
    });

    return await res.json();
  }
}