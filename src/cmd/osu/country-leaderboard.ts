import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  EmbedBuilder,
} from "discord.js";
import Pagination from "../../struct/Paginator";
import AokiError from "@struct/handlers/AokiError";
import AokiClient from "@struct/Client";

export default class CountryLeaderboard extends Subcommand {
  private baseUrl: string;
  private api_v1: string;
  private api_v2: string;
  
  constructor() {
    super({
      name: 'country-leaderboard',
      description: 'get country leaderboard for a specific beatmap',
      permissions: [],
      options: [
        {
          type: 'number',
          name: 'beatmap_id',
          description: 'the beatmap ID to check',
          required: true
        },
        {
          type: 'string',
          name: 'country_code',
          description: 'the country code (2 letters)',
          required: true
        },
        {
          type: 'string',
          name: 'mode',
          description: 'the game mode to check',
          required: true,
          choices: [
            { name: 'osu!standard', value: 'osu' },
            { name: 'osu!taiko', value: 'taiko' },
            { name: 'osu!catch', value: 'fruits' },
            { name: 'osu!mania', value: 'mania' }
          ]
        },
        {
          type: 'string',
          name: 'sort',
          description: 'how to sort the results',
          required: false,
          choices: [
            { name: 'Performance (PP)', value: 'performance' },
            { name: 'Score V3 (lazer)', value: 'lazer_score' },
            { name: 'Score V1 (stable)', value: 'stable_score' },
            { name: 'Combo', value: 'combo' },
            { name: 'Accuracy', value: 'accuracy' }
          ]
        }
      ]
    });
    
    this.baseUrl = "https://osu.ppy.sh";
    this.api_v1 = `${this.baseUrl}/api`;
    this.api_v2 = `${this.baseUrl}/api/v2`;
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const beatmapId = i.options.getNumber('beatmap_id')!;
    const countryCode = i.options.getString('country_code')!.toUpperCase();
    const mode = i.options.getString('mode')!;
    const sort_mode = i.options.getString("sort") || "lazer_score";

    const sortingMap = {
      performance: 0,
      lazer_score: 1,
      stable_score: 2,
      combo: 3,
      accuracy: 4,
    };
    
    const sorting = sortingMap[sort_mode as keyof typeof sortingMap] ?? 0;
    
    if (countryCode.length !== 2) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'Baka, provide a valid 2-letter country code.'
      });
    }
    
    try {
      // Concurrently fetch the first 2 pages of country leaderboard
      const [page1, page2] = await Promise.all([
        this.fetchRankingList({ client: i.client as AokiClient, type: "performance", country_code: countryCode, mode }),
        this.fetchRankingList({ client: i.client as AokiClient, type: "performance", country_code: countryCode, mode, page: 2 }),
      ]);
      
      const rankings = [...page1.ranking, ...page2.ranking];
      if (!rankings.length) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: `No players found for country code ${countryCode}.`
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
            client: i.client as AokiClient,
            type: "user_beatmap_all",
            user_id: userId,
            beatmap_id: beatmapId,
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
          sender: i,
          content: `No scores found for ${countryCode} on this beatmap.`
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
      const beatmapDetails = await this.fetchBeatmapDetails({ client: i.client as AokiClient, type: "difficulty", id: beatmapId });
      const beatmapTitle = `${beatmapDetails.beatmapset.artist} - ${beatmapDetails.beatmapset.title} [${beatmapDetails.version}]`;
      const pages = new Pagination();

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageScores = countryScores.slice(pageIndex * scoresPerPage, (pageIndex + 1) * scoresPerPage);
        const scoreLines = await Promise.all(pageScores.map(async (score, idx) => {
          const user = await this.findUserById(score.user_id, { type: "id" });
          const rankEmote = i.client.utils.osu.rankEmotes[score.rank] || score.rank;
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
            `▸ \`+${score.mods.map((mod: { acronym: string }) => mod.acronym).join("") || 'NM'}\` ▸ Score set ||${i.client.utils.time.formatDistance(new Date(score.ended_at), new Date())}||`
          ].join('\n');
        }));

        const sortString = ["Performance", "ScoreV3 (lazer)", "ScoreV1 (stable)", "Combo", "Accuracy"][sorting];
        const embed = new EmbedBuilder()
          .setTitle(beatmapTitle)
          .setURL(`https://osu.ppy.sh/b/${beatmapId}`)
          .setAuthor({ name: "Country leaderboard", iconURL: `https://osu.ppy.sh/images/flags/${countryCode}.png` })
          .setDescription(`:notes: [Song preview](https://b.ppy.sh/preview/${beatmapDetails.beatmapset_id}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${beatmapDetails.beatmapset_id}/covers/raw.jpg)\n\n` + scoreLines.join('\n\n'))
          .setFooter({ text: `Sorted by ${sortString} | Page ${pageIndex + 1} of ${totalPages}` })
          .setTimestamp()
          .setImage(`https://assets.ppy.sh/beatmaps/${beatmapDetails.beatmapset_id}/covers/cover.jpg`)
          .setColor(10800862);

        pages.add(embed);
      }

      pages.handle({
        sender: i,
        filter: 'userOnly',
        time: 90000
      });

      return;
    } catch (error) {
      console.error('Error fetching country leaderboard:', error);
      return AokiError.API_ERROR({
        sender: i,
        content: 'An error occurred while fetching the country leaderboard. Please try again later.'
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