// the main purpose to implement this is to make things other bots don't have
// there are bots around doing the things that would otherwise take infinite time to implement here in JS
import Command from '../struct/handlers/Command.js';
import {
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} from 'discord.js';
import { osugame } from "../assets/import.js";
import Pagination from '../struct/Paginator.js';

export default new class OsuGame extends Command {
  constructor() {
    super({
      data: osugame,
      permissions: [],
      cooldown: 3
    });
    this.usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
    this.baseUrl = "https://osu.ppy.sh"
    this.api_v1 = `${this.baseUrl}/api`;
    this.api_v2 = `${this.baseUrl}/api/v2`;
    this.api_oa = `${this.baseUrl}/oauth/token`;
    this.api_asset = "https://assets.ppy.sh";
    this.osuV2Token = null;
  };
  // set command
  async set(i, _, util) {
    const user = i.options.getString("username");
    const mode = i.options.getString("mode");
    // handle exceptions
    const settings = i.user.settings;
    if (!settings) await i.user.update({ ingamename: "", defaultmode: "osu" });
    if (!this.usernameRegex.test(user)) return this.throw(i, "Baka, the username is invalid.");
    const profile = await this.findUserByUsername(user, mode);
    if (!profile?.username) return this.throw(i, "Baka, that user doesn't exist.");
    // utilities
    const replies = ["Got that.", "Noted.", "I'll write that in.", "Updated for you.", "One second, writing that in.", "Check if this is right."];
    const reply = `${util.random(replies)} Your current username is \`${profile.username}\`, and your current mode is \`${mode}\`.`;
    // database check
    if (
      settings?.defaultmode && /* entry exists in db */
      settings?.ingamename == profile.username && /* ign is the same */
      settings?.defaultmode == mode /* mode is the same */
    ) {
      return this.throw(i, `${reply}\n\nThat's the same thing you did before, though.`);
    };
    // save to database
    await i.user.update({ ingamename: profile.username, defaultmode: mode });
    return await i.editReply({ content: reply });
  };
  // profile command
  async profile(i, _, util) {
    const settings = i.user.settings;
    const user = i.options.getString("username") || settings?.ingamename;
    const mode = i.options.getString("mode") || settings?.defaultmode;

    // handle exceptions
    if (!user || !mode) return this.throw(i, "You didn't configure your in-game info, baka. I don't know you.\n\nConfigure them with `/osu set` so I can store it.");
    if (!this.usernameRegex.test(user)) return this.throw(i, "Baka, the username is invalid.");
    let profile = await this.findUserByUsername(user, mode);
    if (!profile?.username) return this.throw(i, "Baka, that user doesn't exist.");

    // utilities
    profile = {
      userId: profile.user_id,
      username: profile.username,
      mode: mode,
      properMode: mode == "osu" ? "" : mode,
      level: (+Number(profile.level).toFixed(2)).toString().split("."),
      playTime: Math.floor(Number(profile.total_seconds_played) / 3600),
      playCount: Number(profile.playcount).toLocaleString(),
      pp: (+Number(profile.pp_raw).toFixed(2)).toLocaleString(),
      rank: Number(profile.pp_rank).toLocaleString(),
      accuracy: Number(profile.accuracy).toFixed(2),
      country: profile.country,
      countryRank: Number(profile.pp_country_rank).toLocaleString(),
      ssh: profile.count_rank_ssh,
      ss: profile.count_rank_ss,
      sh: profile.count_rank_sh,
      s: profile.count_rank_s,
      a: profile.count_rank_a,
    };

    // utilities
    const url = [
      `https://lemmmy.pw/osusig/sig.php?`,
      `colour=pink&`,
      `uname=${profile.username}&`,
      `mode=${util.osuNumberModeFormat(mode)}&`,
      `pp=0`
    ].join("")
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(new Uint8Array(buffer));
    profile.image = new AttachmentBuilder().setFile(imageBuffer).setName("profile.png");

    const grades = [];
    const { XH, X, SH, S, A } = util.rankEmotes;
    grades.push(`${XH}\`${Number(profile.ssh)}\``);
    grades.push(`${X}\`${Number(profile.ss)}\``);
    grades.push(`${SH}\`${Number(profile.sh)}\``);
    grades.push(`${S}\`${Number(profile.s)}\``);
    grades.push(`${A}\`${Number(profile.a)}\``);
    const combinedGrades = grades.join('');
    const playTime = `${profile.playTime} hrs`;
    const level = `${profile.level[1]}% of level ${profile.level[0]}`;

    // construct embed
    const author = {
      name: `osu!${profile.properMode} profile for ${profile.username}`,
      iconURL: `https://flagsapi.com/${profile.country}/flat/64.png`,
      url: `${this.baseUrl}/u/${profile.userId}`
    };
    const description = [
      `**▸ Bancho Rank:** #${profile.rank} (${profile.country}#${profile.countryRank})`,
      `**▸ Level:** ${level}`,
      `**▸ PP:** ${profile.pp} **▸ Acc:** ${profile.accuracy}%`,
      `**▸ Playcount:** ${profile.playCount} (${playTime})`,
      `**▸ Ranks:** ${combinedGrades}`,
      `**▸ Profile image:** (from [lemmmy.pw](https://lemmmy.pw))`
    ].join("\n");
    
    const embed = this.embed
      .setAuthor(author)
      .setDescription(description)
      .setImage("attachment://profile.png")

    await i.editReply({ embeds: [embed], files: [profile.image] });
  };
  // set_timestamp_channel command
  async set_timestamp_channel(i) {
    const channel = i.options.getChannel("channel");
    // check if channel is of text type
    if (channel.type != 0) return this.throw(i, "Baka, this feature can only be toggled in text channels.");
    // TODO: make shorthand function for permissions
    // check if the member who executed this was an admin // mod
    if (!channel.permissionsFor(i.guild.members.cache.get(i.user.id)).has(PermissionsBitField.Flags.ManageChannels)) return this.throw(i, "Baka, you don't have the **Manage Channels** permission. You can't edit this settings.");
    // check if we have permission to see the channel
    if (!channel.permissionsFor(i.guild.members.me).has(PermissionsBitField.Flags.ViewChannel)) return this.throw(i, "Baka, I can't see that channel. Enable **View Channel** in permissions view, please.");
    // check if we have permissions to send messages in there
    if (!channel.permissionsFor(i.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) return this.throw(i, "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please.");
    // save the channel
    await i.guild.update({ timestampchannel: channel.id });
    return i.editReply({ content: `Updated the timestamp channel to <#${channel.id}>.` });
  };
  // country-leaderboard
  // this command is complex, some parts might be hard to debug
  async country_leaderboard(i, _, util) {
    const beatmapId = i.options.getInteger('beatmap_id');
    const countryCode = i.options.getString('country_code').toUpperCase();
    const mode = i.options.getString('mode');
    const sort_mode = i.options.getString("sort") || "lazer_score";

    const sortingMap = {
      performance: 0,
      lazer_score: 1,
      stable_score: 2,
      combo: 3,
      accuracy: 4,
    };
    const sorting = sortingMap[sort_mode] ?? 0;

    if (!beatmapId) return this.throw(i, 'Please provide a valid beatmap ID.');
    if (!countryCode || countryCode.length !== 2) return this.throw(i, 'Please provide a valid 2-letter country code.');

    try {
      // concurrently fetch the first 2 pages of country leaderboard
      const [page1, page2] = await Promise.all([
        this.fetchRankingList({ type: "performance", country_code: countryCode, mode }),
        this.fetchRankingList({ type: "performance", country_code: countryCode, mode, page: 2 }),
      ]);
      const rankings = [...page1.ranking, ...page2.ranking];
      if (!rankings.length) return this.throw(i, `No players found for country code ${countryCode}.`);

      const userIds = rankings.map(player => player.user.id);
      const countryScores = [];
      const chunkSize = 20;
      // use chunks to process these data
      for (let j = 0; j < userIds.length; j += chunkSize) {
        const chunk = userIds.slice(j, j + chunkSize);
        const results = await Promise.allSettled(chunk.map(userId =>
          this.listAllUserScores({
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
      
      if (!countryScores.length) return this.throw(i, `No scores found for ${countryCode} on this beatmap.`);

      // sort by metric chosen by user
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
      const beatmapDetails = await this.fetchBeatmapDetails({ type: "difficulty", id: beatmapId });
      const beatmapTitle = `${beatmapDetails.beatmapset.artist} - ${beatmapDetails.beatmapset.title} [${beatmapDetails.version}]`;
      const pages = new Pagination();

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageScores = countryScores.slice(pageIndex * scoresPerPage, (pageIndex + 1) * scoresPerPage);
        const scoreLines = await Promise.all(pageScores.map(async (score, idx) => {
          const user = await this.findUserById(score.user_id, { type: "id" });
          const rankEmote = util.rankEmotes[score.rank] || score.rank;
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
            `▸ \`+${score.mods.map(mod => mod.acronym).join("") || 'NM'}\` ▸ Score set ||${util.formatDistance(new Date(score.ended_at), new Date())}||`
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

      const content =
        "**Notes:** \n- Scores from inactive players will not be shown.\n- Only players in the top 100 of that country are fetched.";
      const msg = await i.editReply({ content, embeds: [pages.currentPage] });
      if (pages.size === 1) return;

      // Reaction-based pagination using a collector with navigator emojis
      const navigators = ['◀', '▶', '❌'];
      const filter = (_, user) => user.id === i.member.user.id;
      const collector = msg.createReactionCollector(filter, { time: 90000 });
      for (const nav of navigators) await msg.react(nav);

      collector.on('collect', async r => {
        switch (r.emoji.name) {
          case '◀': msg.edit({ content, embeds: [pages.previous()] }); break;
          case '▶': msg.edit({ content, embeds: [pages.next()] }); break;
          case '❌': collector.stop(); break;
        }
        await r.users.remove(i.member.user.id);
      });
      collector.on('end', async () => await msg.reactions.removeAll());
    } catch (error) {
      console.error('Error fetching country leaderboard:', error);
      this.throw(i, 'An error occurred while fetching the country leaderboard. Please try again later.');
    }
  }
  // beatmap search utility
  async beatmap(i, query, util) {
    const mode = i.options.getString("mode") || "0";
    const status = i.options.getString("status") || "any";
    const sort = i.options.getString("sort") || "relevance";
    const genre = i.options.getString("genre") || "any";
    const language = i.options.getString("language") || "any";
    const storyboard = i.options.getBoolean("storyboard");

    try {
      const searchParams = {
        query: query,
        m: Number(mode),
        status: status,
        genre: genre,
        language: language,
        sort: sort,
      };

      if (storyboard !== null) {
        searchParams.storyboard = storyboard ? '1' : '0';
      }

      const { beatmapsets } = await this.searchBeatmap({
        type: "beatmaps",
        ...searchParams
      });

      if (beatmapsets.length === 0) {
        return this.throw(i, "No beatmaps found matching your criteria.");
      }
      // nsfw stuff
      const beatmapsFiltered = beatmapsets.filter(beatmap => {
        if (i.channel.nsfw) return true;
        else return !beatmap.nsfw;
      });
      // take only 25 first results
      const beatmaps = beatmapsFiltered.slice(0, 25);
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('beatmap_select')
        .setPlaceholder(`Listing ${beatmaps.length} top result${beatmaps.length == 1 ? "" : "s"}. Select to view.`)
        .addOptions(beatmaps.map((beatmap, index) => ({
          label: `${beatmap.artist} - ${beatmap.title}`,
          description: `Mapper: ${beatmap.creator} | Status: ${util.toProperCase(beatmap.status)}`,
          value: index.toString()
        })));

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const message = await i.editReply({ components: [row] });

      const filter = (interaction) => interaction.customId === 'beatmap_select' && interaction.user.id === i.user.id;
      const collector = message.createMessageComponentCollector({ filter, time: 120000 }); // 2 minutes

      collector.on('collect', async (interaction) => {
        const selectedIndex = parseInt(interaction.values[0]);
        const selectedBeatmap = beatmaps[selectedIndex];

        const detailedEmbed = new EmbedBuilder()
          .setColor(10800862)
          .setAuthor({
            name: `Mapped by ${selectedBeatmap.creator}`,
            iconURL: `https://a.ppy.sh/${selectedBeatmap.user_id}`
          })
          .setDescription(`:notes: [Song preview](https://b.ppy.sh/preview/${selectedBeatmap.id}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/raw.jpg)`)
          .setTitle(`${util.escapeMarkdown(selectedBeatmap.artist)} - ${util.escapeMarkdown(selectedBeatmap.title)}`)
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}`)
          .setImage(`https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/cover.jpg`)
          .addFields(
            { name: "Raw Title", value: `${util.escapeMarkdown(selectedBeatmap.artist_unicode)} - ${util.escapeMarkdown(selectedBeatmap.title_unicode)}`, inline: false },
            { name: "Source", value: selectedBeatmap.source || "None", inline: false },
            { name: "BPM", value: selectedBeatmap.bpm.toString(), inline: true },
            { name: "Favorites", value: selectedBeatmap.favourite_count.toString(), inline: true },
            { name: "Spotlight Status", value: util.toProperCase(selectedBeatmap.spotlight.toString()), inline: true },
            { name: "Set ID", value: selectedBeatmap.id.toString(), inline: true },
            { name: "Is NSFW?", value: util.toProperCase(selectedBeatmap.nsfw.toString()), inline: true },
            { name: "Last updated", value: util.formatDistance(new Date(selectedBeatmap.last_updated), new Date()), inline: true },
            { name: "Status", value: `${util.toProperCase(selectedBeatmap.status)}${selectedBeatmap.ranked_date ? ` on ${util.formatDate(new Date(selectedBeatmap.ranked_date), "ddMMMMyyyy")}` : ""}`, inline: false },
          )
          .setFooter({ text: `This set has ${selectedBeatmap.beatmaps.length} ${selectedBeatmap.status} beatmaps` })
          .setTimestamp();

        const downloadButton = new ButtonBuilder()
          .setLabel('osu!web download')
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}`)
          .setStyle(ButtonStyle.Link);

        const directButton = new ButtonBuilder()
          .setLabel('osu!direct')
          .setURL(`https://aoki.hackers.moe/osu/direct?id=${selectedBeatmap.id}`)
          .setStyle(ButtonStyle.Link);

        const nerinyanButton = new ButtonBuilder()
          .setLabel('nerinyan')
          .setURL(`https://api.nerinyan.moe/d/${selectedBeatmap.id}`)
          .setStyle(ButtonStyle.Link);

        const buttonRow = new ActionRowBuilder()
          .addComponents(downloadButton, directButton, nerinyanButton);

        await interaction.update({ embeds: [detailedEmbed], components: [row, buttonRow] });
      });

      collector.on('end', () => {
        selectMenu.setDisabled(true);
        i.editReply({ components: [row] }).catch(console.error);
      });

    } catch (error) {
      console.error("Error fetching beatmap:", error);
      return this.throw(i, "An error occurred while searching for beatmaps. Please try again later.");
    }
  };
  // utilities
  async findUserByUsername(username, mode) {
    return (await fetch([
      `${this.api_v1}/get_user?`,
      `k=${process.env["OSU_KEY"]}&`,
      `u=${username}&`,
      `m=${this.i.client.util.osuNumberModeFormat(mode)}`
    ].join("")).then(async res => await res.json()))[0];
  };
  get embed() {
    return new EmbedBuilder()
      .setColor(10800862)
      .setTimestamp()
      .setFooter({
        text: "Ooh",
        iconURL: this.i.user.displayAvatarURL()
      });
  };

  // osu!api helpers
  async getOsuV2Token() {
    // avoid spamming the osu api
    // if the token is still valid, return it
    if (this.osuV2Token && this.osuV2Token.expires_at > Date.now()) {
      return this.osuV2Token.access_token;
    }
    // otherwise ask for it using our credentials
    const params = new URLSearchParams({
      client_id: this.dev ? process.env.OSU_DEV_ID : process.env.OSU_ID,
      client_secret: this.dev ? process.env.OSU_DEV_SECRET : process.env.OSU_SECRET,
      grant_type: 'client_credentials',
      scope: 'public'
    });
    const res = await fetch(this.api_oa, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const data = await res.json();
    // then save it for later fetches until the end of the cycle
    this.osuV2Token = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000
    };
    return data.access_token;
  }

  // this function uses user id instead, which for the findUserByUsername function we don't know yet
  async findUserById(userId, options) {
    const params = new URLSearchParams({
      k: process.env["OSU_KEY"],
      u: userId.toString(),
      type: options.type
    });
    const url = `${this.api_v1}/get_user?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0] || null;
  }

  async fetchRankingList({ type, country_code, mode, page = 1 }) {
    const token = await this.getOsuV2Token();
    const url = `${this.api_v2}/rankings/${mode}/${type}?country=${country_code}&cursor[page]=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  }

  async listAllUserScores({ type, user_id, beatmap_id, mode, include_fails, limit }) {
    const token = await this.getOsuV2Token();
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

  async fetchBeatmapDetails({ type, id }) {
    const token = await this.getOsuV2Token();
    const url = `${this.api_v2}/beatmaps/${id}?type=${type}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "x-api-version": "20240130" }
    });
    return await res.json();
  }

  async searchBeatmap(params) {
    const token = await this.getOsuV2Token();
    const searchParams = new URLSearchParams(params);
    const url = `${this.api_v2}/beatmapsets/search?${searchParams.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "x-api-version": "20240130" }
    });
    return await res.json();
  }
}