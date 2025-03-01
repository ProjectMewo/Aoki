import Command from '../struct/handlers/Command';
import Pagination from '../struct/Paginator';
import { EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction, TextChannel, MessageReaction, User as DiscordUser } from 'discord.js';
import { Watching, User } from "../assets/graphql";
import { anime } from "../assets/import";

interface ErrorMessages {
  500: string;
  400: string;
  default: string;
}

export default new class Anime extends Command {
  private jikan_v4: string;
  private ErrorMessages: ErrorMessages;

  constructor() {
    super({
      data: anime,
      permissions: [],
      cooldown: 2
    });
    // static and reusable variables
    this.jikan_v4 = "https://api.jikan.moe/v4";
    this.ErrorMessages = {
      500: "The service is probably dead. Wait a little bit, then try again.",
      400: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.",
      default: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
    };
  }

  // action command
  public async action(i: ChatInputCommandInteraction, query: string): Promise<any> {
    const { url } = await this.fetch(`https://waifu.pics/sfw/${query}`);
    return await i.editReply({ embeds: [this.embed.setImage(url)] });
  }

  // quote command
  public async quote(i: ChatInputCommandInteraction): Promise<any> {
    const { author, anime, quote } = await fetch(`https://waifu.it/api/v4/quote`, {
      headers: { 'Authorization': process.env.WAIFU_IT || "" }
    }).then(async res => await res.json());
    return await i.editReply({ content: `**${author}** from **${anime}**:\n\n*${quote}*` });
  }

  // random command
  public async random(i: ChatInputCommandInteraction, _: any, util: any): Promise<any> {
    // processing api response
    const type = i.options.getString("type");
    const res = (await this.fetch(`${this.jikan_v4}/random/${type}`)).data;
    if (!res) return this.throw(i, this.ErrorMessages.default);
    const stats = {
      "Main Genre": res.genres?.[0]?.name || "No data",
      ...(type === "anime") ?
        {
          "Source": res.source || "No data",
          "Episodes": res.episodes || "No data", 
          "Status": res.status || "No data",
          "Schedule": res.broadcast?.day ? `${res.broadcast.day}s` : "No data",
          "Duration": res.duration?.replace(/ per /g, "/") || "No data"
        } : {
          "Chapters": res.chapters || "No data",
          "Volumes": res.volumes || "No data"
        }
    };
    const scores = {
      "Mean Rank": res.rank || "No data",
      "Popularity": res.popularity || "No data",
      "Favorites": res.favorites || "No data",
      "Subscribed": res.members || "No data",
      ...(type === "anime") ?
        {
          "Average Score": res.score || "No data",
          "Scored By": res.scored_by || "No data",
        } : {}
    };
    const description = [
      util.textTruncate((res.synopsis || '').replace(/(<([^>]+)>)/ig, ''), 350, `...`),
      `\n• **Main Theme:** ${res.themes?.[0]?.name || 'Unspecified'}`,
      `• **Demographics:** ${res.demographics?.[0]?.name || 'Unspecified'}`,
      `• **Air Season:** ${res.season ? util.toProperCase(res.season) : "Unknown"}`,
      // the banner must be served as a hotlink
      // top.gg does check the setImage field and the setThumbnail field
      `\n*More about the ${type} can be found [here](${res.url}), and the banner can be found [here](${res.images?.jpg.image_url}).*`
    ].join('\n');
    // extending preset embed
    const embed = this.embed
      .setFooter({ text: `Data sent from MyAnimeList`, iconURL: i.user.displayAvatarURL() })
      .setAuthor({ name: `${res.title}`, iconURL: res.images?.jpg.image_url })
      .setDescription(description)
      .addFields([
        { name: `${util.toProperCase(type)} Info`, inline: true, value: util.keyValueField(stats, 25) },
        { name: `${util.toProperCase(type)} Scorings`, inline: true, value: util.keyValueField(scores, 25) }
      ]);
    return await i.editReply({ embeds: [embed] });
  }

  // profile command
  public async profile(i: ChatInputCommandInteraction, query: string, util: any): Promise<any> {
    // processing user query
    // this option is enforced, so we put ! here
    const platform = i.options.getString("platform")!;
    if (await util.isProfane(query)) this.throw(i, "Stop sneaking in bad content please, you baka.");
    const fetchData = {
      al: async () => await util.anilist(User, { search: query }),
      mal: async () => (await this.fetch(`${this.jikan_v4}/users/${query}/full`)).data
    }
    // platform will always be al or mal, so we cast it to fetchdata
    const res = await fetchData[platform as keyof typeof fetchData]();
    // handling errors
    if (!res) return this.throw(i, this.ErrorMessages[400]);
    else if (res?.errors) {
      const errorCodes = res.errors;
      if (errorCodes.some((code: any) => code.status >= 500)) {
        return this.throw(i, this.ErrorMessages[500]);
      } else if (errorCodes.some((code: any) => code.status >= 400)) {
        return this.throw(i, this.ErrorMessages[400]);
      } else return this.throw(i, this.ErrorMessages.default);
    }
    // generate a preset embed
    const presetEmbed = this.embed.setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() });
    // conditional for each platform
    if (platform == "mal") {
      // processing api response
      /**
       * format AniList array information
       * 
       * Method scoped in here is exclusive for animes and mangas
       * @param {Array} arr Array of query info to work with
       * @returns `String`
       */
      const spreadMap = function (arr: Array<any>) {
        const res = util.joinArrayAndLimit(arr.map((entry) => {
          return `[${entry[entry.title ? "title" : "name"]}](${entry.url.split('/').splice(0, 5).join('/')})`;
        }), 1000, ' • ');
        return res.text + (!!res.excess ? ` and ${res.excess} more!` : '') || 'None Listed.'
      };
      const fav = {
        anime: spreadMap(res.favorites.anime),
        manga: spreadMap(res.favorites.manga),
        chars: spreadMap(res.favorites.characters),
        people: spreadMap(res.favorites.people)
      };
      const cleanedAboutField = (res.about || '').replace(/(<([^>]+)>)/ig, '');
      const description = [
        util.textTruncate(cleanedAboutField, 350, `... *[read more here](${res.url})*`),
        `• **Gender:** ${res.gender || 'Unspecified'}`,
        `• **From:** ${res.location || 'Unspecified'}`,
        `• **Joined:** ${util.formatDate(new Date(res.joined), 'dd MMMM yyyy')}`,
        `• **Last Seen:** ${util.formatDate(new Date(res.last_online), 'dd MMMM yyyy')}`
      ].join('\n');
      // extending preset embed
      const embed = presetEmbed
        .setAuthor({ name: `${res.username}'s Profile`, iconURL: res.images.jpg.image_url })
        .setDescription(description)
        .addFields([
          { name: 'Anime Stats', value: util.keyValueField(res.statistics.anime), inline: true },
          { name: 'Manga Stats', value: util.keyValueField(res.statistics.manga), inline: true },
          { name: 'Favourite Anime', value: fav.anime },
          { name: 'Favorite Manga', value: fav.manga },
          { name: 'Favorite Characters', value: fav.chars },
          { name: 'Favorite Staffs', value: fav.people }
        ]);
      return await i.editReply({ embeds: [embed] });
    } else {
      // processing api response
      const topFields = Object.entries(res.data.User.favourites).map(([query, target]) => {
        const firstTarget = (target as any).edges.map((entry: any) => {
          const identifier = entry.node.title || entry.node.name;
          const name = typeof identifier === 'object' ? identifier.userPreferred || identifier.full : identifier;
          return `[**${name}**](${entry.node.siteUrl})`;
        }).join('|') || 'None Listed';
        return `\n**Top 1 ${query}:** ` + firstTarget.split("|")[0];
      });
      const description = res.data.User.about ? util.textTruncate(util.heDecode(res.data.User.about?.replace(/(<([^>]+)>)/g, '') || ''), 250) : "No description provided";
      // extending preset embed
      const embed = presetEmbed
        .setImage(res.data.User.bannerImage)
        .setThumbnail(res.data.User.avatar.medium)
        .setTitle(res.data.User.name)
        .setURL(res.data.User.siteUrl)
        .setDescription(`***About the user:** ${description}*` + `\n${topFields}`);
      return await i.editReply({ embeds: [embed] });
    }
  }

  // schedule command
  public async airing(i: ChatInputCommandInteraction, query: string, util: any): Promise<any> {
    const channelNSFW = (i.channel instanceof TextChannel) ? i.channel.nsfw : false;
    const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${query}${channelNSFW ? "" : "&sfw=true"}`).then(async res => await res.json());
    // handle error
    if (!res) return this.throw(i, this.ErrorMessages[400]);
    else if (res?.status) {
      const errorCodes = res.status;
      if (errorCodes.some((code: any) => code.status >= 500)) {
        return this.throw(i, this.ErrorMessages[500]);
      } else if (errorCodes.some((code: any) => code.status >= 400)) {
        return this.throw(i, this.ErrorMessages[400]);
      } else return this.throw(i, this.ErrorMessages.default);
    }
    // helpers
    const elapsed = Date.now() - i.createdTimestamp;
    const navigators = ['◀', '▶', '❌'];
    // pagination
    const pages = new Pagination();
    for (const data of res.data) {
      // helpers
      const description = [
        `${data.score ? `**Score**: ${data.score}\n` : ''}`,
        `${data.genres.map((x: any) => `[${x.name}](${x.url})`).join(' • ')}\n\n`,
        `${data.synopsis ? util.textTruncate(data.synopsis, 300, `... *(read more [here](${data.url}))*`) : "*No synopsis available*"}`
      ].join("");
      const footer = [
        `Search duration: ${Math.abs(elapsed / 1000).toFixed(2)} seconds`,
        `Page ${pages.size == null ? 1 : pages.size + 1} of ${res.data.length}`,
        `Data sent from MyAnimeList`
      ].join(" | ");
      const fields = [
        { name: 'Type', value: `${data.type || 'Unknown'}`, inline: true },
        { name: 'Started', value: `${new Date(data.aired.from).toISOString().substring(0, 10)}`, inline: true },
        { name: 'Source', value: `${data.source || 'Unknown'}`, inline: true },
        { name: 'Producers', value: `${data.producers.map((x: any) => `[${x.name}](${x.url})`).join(' • ') || 'None'}`, inline: true },
        { name: 'Licensors', value: `${data.licensors.join(' • ') || 'None'}`, inline: true },
        { name: '\u200b', value: '\u200b', inline: true }
      ];
      // build base page embed
      const page = new EmbedBuilder()
        .setColor(10800862)
        .setThumbnail(data.images.jpg.image_url)
        .setDescription(description)
        .setAuthor({ name: `${data.title}`, url: data.url })
        .setFooter({ text: footer, iconURL: (i.member?.user as DiscordUser).displayAvatarURL() })
        .addFields(fields);
      pages.add(page);
    }
    // send initial message
    const msg = await i.editReply({ embeds: [pages.currentPage] });
    // if page size is 1 do nothing else
    if (pages.size == 1) return;
    // collector
    const filter = (_: MessageReaction, user: DiscordUser) => user.id === i.user.id;
    const collector = msg.createReactionCollector({ filter });
    let timeout = setTimeout(() => collector.stop(), 90000);

    for (let i = 0; i < navigators.length; i++) {
      await msg.react(navigators[i]);
    }

    collector.on('collect', async r => {
      switch (r.emoji.name) {
        // as we have error management if there's nothing in the pages manager,
        // we can safely say there definitely will be value in there
        case navigators[0]: msg.edit({ embeds: [pages.previous()!] }); break
        case navigators[1]: msg.edit({ embeds: [pages.next()!] }); break
        case navigators[2]: collector.stop(); break
      }
      await r.users.remove(i.member?.user.id);
      timeout.refresh();
    });

    collector.on('end', async () => await msg.reactions.removeAll());
  }

  // search autocomplete
  public async search_autocomplete(i: AutocompleteInteraction, focusedValue: string): Promise<void> {
    const type = i.options.getString("type");
    // we try to use jikan api to try make sense what the user is possibly typing
    const res = await this.fetch(`${this.jikan_v4}/${type}?q=${focusedValue}`);
    const data = res.data; // this is the array we need to work with
    // now we filter this array by taking the title
    // be sure to leave nsfw content out if we're not in such a channel
    const nsfw = (i.channel as TextChannel).nsfw;
    const names = data.filter(
      (name: any) => {
        let reqName: string;
        if (type == "anime" || type == "manga") reqName = name.title;
        else if (type == "characters" || type == "people") reqName = name.name;
        // reqName will definitely have a value
        // so we ignore the error here by !
        return reqName!.toLowerCase().includes(focusedValue.toLowerCase()) && (nsfw || !name.rating || !["R-17"].includes(name.rating));
      }
    );
    // we then limit this list down to 25 results
    const namesLimited = names.slice(0, 25);
    // finally, we respond to the autocomplete interaction
    await i.respond(
      namesLimited.map((names: any) => ({
        name: names.name ? names.name : names.title,
        value: names.mal_id.toString(),
      })),
    );
  }

  // search command
  public async search(i: ChatInputCommandInteraction, query: string, util: any): Promise<any> {
    // processing user query
    const type = i.options.getString("type");
    // try to use jikan api to fetch the query
    // we assume all queries must have been handled by autocomplete, and the value has to be an id
    const jikanURL = (type: string) => {
      // for characters, we need the full query to have their appearances and their voice actors
      return `${this.jikan_v4}/${type}/${query}${['characters', 'people'].includes(type) ? "/full" : ""}`;
    };
    const fetchData = {
      anime: async () => await this.fetch(jikanURL("anime")),
      manga: async () => await this.fetch(jikanURL("manga")),
      characters: async () => await this.fetch(jikanURL("characters")),
      people: async () => await this.fetch(jikanURL("people"))
    };
    // the same casting as before
    // type will always be something available in fetchData
    const res = await fetchData[type as keyof typeof fetchData]();
    // error handling
    if (
      !res || /* universal */
      ((type == "anime" || type == "manga") && !res.data) /* jikan response */
    ) {
      return this.throw(i, this.ErrorMessages[400]);
    }
    // processing api response
    const data = res.data;
    const channelNSFW = (i.channel instanceof TextChannel) ? i.channel.nsfw : false;
    if (
      (type == "anime" || type == "manga") &&
      data.rating &&
      (["R-17"].includes(data.rating)) &&
      !channelNSFW
    ) {
      return this.throw(i, "The content given to me by MyAnimeList has something to do with R-17 content, and I can't show that in this channel, sorry. Get in a NSFW channel, please.");
    }
    // handling by type
    if (type == "anime" || type == "manga") {
      // processing api response
      const presetEmbed = this.embed
        .setTitle(`${data.title}`) /* default title */
        .setURL(`${data.url}`) /* default url */
        .setThumbnail(data.images.jpg.small_image_url) /* default thumbnail */
        .setDescription(
          `*The cover of this ${type} can be found [here](${data.images.jpg.large_image_url})*\n\n` +
          `**Description:** ${util.textTruncate(`${data.synopsis}`, 250, `... *(read more [here](${data.url}))*`)}`
        )
      // we generally can tell if a series is NSFW by checking if it has explicit genres
      // and if the age rating guide is R-17
      const nsfw = Boolean(data.rating && ["R-17"].includes(data.rating) && data.explicit_genres.length);
      const fields = [
        { name: "Type", value: `${util.toProperCase(data.type)}`, inline: true },
        { name: "Status", value: util.toProperCase(`${data.status}`), inline: true },
        { name: "Air Date", value: `${data[type == "anime" ? "aired" : "published"].string}`, inline: true },
        { name: "Avg. Rating", value: `${data.score?.toLocaleString() || "Unknown"}`, inline: true },
        { name: "Age Rating", value: `${data.rating?.replace(")", "") || "Unknown"}`, inline: true },
        { name: "Rating Rank", value: `#${data.rank?.toLocaleString() || "Unknown"}`, inline: true },
        { name: "Popularity", value: `#${data.popularity?.toLocaleString() || "Unknown"}`, inline: true },
        ...(type == "anime") ?
          [
            { name: "NSFW?", value: util.toProperCase(`${nsfw}`), inline: true },
            { name: "Ep. Count", value: `${data.episodes}`, inline: true },
          ] : [
            { name: "Volume Count", value: `${data.volumes || "Unfinished"}`, inline: true },
            { name: "Chapter Count", value: `${data.chapters || "Unfinished"}`, inline: true },
          ]
      ];
      const embed = presetEmbed.addFields(fields);
      await i.editReply({ embeds: [embed] });
    }
    // character
    else if (type == "characters") {
      // processing api response
      const spreadMap = function (arr: Array<any>, type: string) {
        // if the array is empty we return none listed
        if (!arr?.length) return 'None Listed.';
        // take only first 5 entries to avoid too long outputs
        const limitedArr = arr.slice(0, 5);
        const res = util.joinArrayAndLimit(limitedArr.map((entry) => {
          return `[${entry[type][entry[type]?.title ? "title" : "name"]}](${entry[type].url})`;
        }), 350, ' • ');
        // show total count if there are more
        const remaining = arr.length - limitedArr.length;
        return res.text + (remaining > 0 ? ` and ${remaining} more!` : '') || 'None Listed.';
      };
      // extending preset embed
      const presetEmbed = this.embed
        .setTitle(`${data.name} // ${data.name_kanji || data.name}`) /* default title */
        .setURL(`${data.url}`) /* default url */
        .setThumbnail(data.images.jpg.image_url) /* default thumbnail */
        .setDescription(
          `*The portrait of this character can be found [here](${data.images.jpg.image_url})*\n\n` +
          `**About this character:** \n${util.textTruncate(`${data.about || "*They might be a support character, so there's no description about them yet. Maybe you could write one if you like them?*"}`, 500, `... *(read more [here](${data.url}))*`)}`
        )
      const fields = [
        { name: `${data.name} appears in these anime...`, value: spreadMap(data.anime, "anime") },
        { name: `They also appear in these manga...`, value: spreadMap(data.manga, "manga") },
        { name: `They're voiced by...`, value: spreadMap(data.voices, "person") }
      ];
      const embed = presetEmbed.addFields(fields);
      await i.editReply({ embeds: [embed] });
    }
    // people
    else if (type == "people") {
      // processing api response
      const spreadMap = function (arr: Array<any>, type: string) {
        // if the array is empty we return none listed
        if (!arr?.length) return 'None Listed.';
        // take only first 5 entries to avoid too long outputs
        const limitedArr = arr.slice(0, 5);
        const res = util.joinArrayAndLimit(limitedArr.map((entry) => {
          return `[${entry[type][entry[type].title ? "title" : "name"]}](${entry[type].url})`;
        }), 350, ' • ');
        // show total count if there are more
        const remaining = arr.length - limitedArr.length;
        return res.text + (remaining > 0 ? ` and ${remaining} more!` : '') || 'None Listed.';
      };
      // extending preset embed
      const presetEmbed = this.embed
        .setTitle(`${data.name}`) /* default name */
        .setURL(`${data.url}`) /* default url */
        .setThumbnail(data.images.jpg.image_url) /* default thumbnail */
        .setDescription(
          `*The portrait of ${data.name} can be found [here](${data.images.jpg.image_url})*\n\n` +
          `**About them:** \n${util.textTruncate(`${data.about || "*They might be someone who hasn't been very notable on MyAnimeList yet. Maybe you could write one if you like them?*"}`, 500, `... *(read more [here](${data.url}))*`)}`
        )
      const fields = [
        // birthdate
        { name: "Birthdate", value: `${new Date(data.birthday).toLocaleDateString("en-GB") || "Unknown"}`, inline: false },
        { name: "Given Name", value: `${data.given_name || "Unknown"}`, inline: true },
        { name: "Family Name", value: `${data.family_name || "Unknown"}`, inline: true },
        { name: `${data.name} appears in these anime...`, value: spreadMap(data.anime, "anime") },
        { name: `They also appear in these manga...`, value: spreadMap(data.manga, "manga") },
        { name: `They voice these characters...`, value: spreadMap(data.voices, "character") }
      ];
      const embed = presetEmbed.addFields(fields);
      await i.editReply({ embeds: [embed] });
    }
  }

  // schedule current command
  public async current(i: ChatInputCommandInteraction, _: any, util: any): Promise<any> {
    // get user schedules
    const schedule = await i.user.getSchedule();
    // handle exceptions
    if (!schedule) return this.throw(i, "Baka, you have no anime subscription.");
    // get watching data
    const res = (await util.anilist(Watching, {
      watched: [schedule.anilistid],
      page: 0
    })).data.Page.media[0];
    // handle errors
    if (!res) return this.throw(i, this.ErrorMessages[400]);
    else if (res?.errors) {
      const errorCodes = res.errors;
      if (errorCodes.some((code: any) => code.status >= 500)) {
        return this.throw(i, this.ErrorMessages[500]);
      } else if (errorCodes.some((code: any) => code.status >= 400)) {
        return this.throw(i, this.ErrorMessages[400]);
      } else return this.throw(i, this.ErrorMessages.default);
    }
    // handle api response
    const title = `[${res.title.romaji}](${res.siteUrl})`;
    const nextepisode = res.nextAiringEpisode.episode;
    const timeUntilAiring = Math.round(res.nextAiringEpisode.timeUntilAiring / 3600);
    // send response
    return await i.editReply({ content: `You are currently watching **${title}**. Its next episode is **${nextepisode}**, airing in about **${timeUntilAiring} hours**.` });
  }

  // schedule add autocomplete
  // having the user type in the id themselves is not intuitive, so we implement this for ease of use
  public async add_autocomplete(i: AutocompleteInteraction, focusedValue: string): Promise<void> {
    // we try to use jikan api to try make sense what the user is possibly typing
    const res = await this.fetch(`${this.jikan_v4}/anime?q=${focusedValue}`);
    const data = res.data; // this is the array we need to work with
    // now we filter this array by taking the title
    const names = data.filter(
      (name: any) => name.title.toLowerCase().includes(focusedValue.toLowerCase())
    );
    // we then limit this list down to 25 results
    const namesLimited = names.slice(0, 25);
    // finally, we respond to the autocomplete interaction
    await i.respond(
      namesLimited.map((names: any) => ({
        name: names.title,
        value: names.mal_id.toString(),
      })),
    );
  }

  // schedule add command
  public async add(i: ChatInputCommandInteraction, query: string, util: any): Promise<any> {
    // get user schedule
    const schedule = await i.user.getSchedule();
    // handle exceptions
    if (schedule?.anilistid) return this.throw(i, "Baka, you can only have **one schedule** running at a time.");
    // handle user query
    const anilistid = await util.getMediaId(query);
    if (!anilistid) return this.throw(i, this.ErrorMessages[400]);
    const media = (await util.anilist(Watching, {
      watched: [anilistid],
      page: 0
    })).data.Page.media[0];
    // handle errors
    if (!media) return this.throw(i, this.ErrorMessages[400]);
    else if (media?.errors) {
      const errorCodes = media.errors;
      if (errorCodes.some((code: any) => code.status >= 500)) {
        return this.throw(i, this.ErrorMessages[500]);
      } else if (errorCodes.some((code: any) => code.status >= 400)) {
        return this.throw(i, this.ErrorMessages[400]);
      } else return this.throw(i, this.ErrorMessages.default);
    }
    if (!["NOT_YET_RELEASED", "RELEASING"].includes(media.status)) return this.throw(i, "Baka, that's not airing. It's not an upcoming one, too. Maybe even finished.");
    // update database
    await i.user.setSchedule({ anilistid: media.id, nextep: media.nextAiringEpisode.episode });
    // send result
    const title = media.title.romaji;
    const timeUntilAiring = Math.round(media.nextAiringEpisode.timeUntilAiring / 3600);
    return await i.editReply({ content: `Tracking airing episodes for **${title}**. Next episode is airing in about **${timeUntilAiring} hours**.` });
  }

  // schedule remove command
  public async remove(i: ChatInputCommandInteraction, _: any, util: any): Promise<any> {
    // get user schedule
    const schedule = await i.user.getSchedule();
    // handle exceptions
    if (!schedule?.anilistid) return this.throw(i, "Baka, you have no anime subscription.");
    // handle user query
    const res = (await util.anilist(Watching, {
      watched: [schedule.anilistid],
      page: 0
    })).data.Page.media[0];
    // handle errors
    if (!res) return this.throw(i, this.ErrorMessages[400]);
    else if (res?.errors) {
      const errorCodes = res.errors;
      if (errorCodes.some((code: any) => code.status >= 500)) {
        return this.throw(i, this.ErrorMessages[500]);
      } else if (errorCodes.some((code: any) => code.status >= 400)) {
        return this.throw(i, this.ErrorMessages[400]);
      } else return this.throw(i, this.ErrorMessages.default);
    }
    // update database
    await i.user.setSchedule({ anilistid: 0, nextep: 0 });
    // send message
    return await i.editReply({ content: `Stopped tracking airing episodes for **${res.title.romaji}**.` });
  }

  // internal utilities
  async fetch(url: string) {
    return await fetch(url).then(async res => await res.json());
  };
  get embed() {
    return new EmbedBuilder().setColor(10800862).setTimestamp();
  };
}
