import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { UserData } from "../../types/anilist";

export default class Profile extends Subcommand {
  constructor() {
    super({
      name: 'profile',
      description: 'Get an anime profile from MyAnimeList or AniList',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'platform',
          description: 'The platform to search on',
          required: true,
          choices: [
            { name: 'MyAnimeList', value: 'mal' },
            { name: 'AniList', value: 'al' }
          ]
        },
        {
          type: 'string',
          name: 'username',
          description: 'The username to search for',
          required: true
        }
      ]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const platform = i.options.getString("platform")!;
    const username = i.options.getString("username")!;
    const utils = i.client.utils;
    const jikan_v4 = "https://api.jikan.moe/v4";
    
    // Check for profanity
    if (await utils.profane.isProfane(username)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Stop sneaking in bad content please, you baka."
      });
    }
    
    try {
      let result;
      
      // Handle different platforms
      if (platform === 'mal') {
        const response = await fetch(`${jikan_v4}/users/${username}/full`);
        
        if (!response.ok) {
          return AokiError.NOT_FOUND({
            sender: i,
            content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
          });
        }
        
        const data = await response.json();
        result = data.data;
        
        if (!result) {
          return AokiError.NOT_FOUND({
            sender: i,
            content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
          });
        }
        
        // Format MAL data
        const spreadMap = function(arr: Array<{
          title?: string,
          name?: string,
          url: string
        }>) {
          const res = utils.string.joinArrayAndLimit(arr.map((entry) => {
            return `[${entry[entry.title ? "title" : "name"]}](${entry.url.split('/').splice(0, 5).join('/')})`;
          }), 1000, ' • ');
          return res.text + (!!res.excess ? ` and ${res.excess} more!` : '') || 'None Listed.';
        };
        
        const favorites = {
          anime: spreadMap(result.favorites.anime),
          manga: spreadMap(result.favorites.manga),
          chars: spreadMap(result.favorites.characters),
          people: spreadMap(result.favorites.people)
        };
        
        const cleanedAboutField = (result.about || '').replace(/(<([^>]+)>)/ig, '');
        const description = [
          utils.string.textTruncate(cleanedAboutField, 350, `... *[read more here](${result.url})*`),
          `• **Gender:** ${result.gender || 'Unspecified'}`,
          `• **From:** ${result.location || 'Unspecified'}`,
          `• **Joined:** ${utils.time.formatDate(new Date(result.joined), 'dd MMMM yyyy')}`,
          `• **Last Seen:** ${utils.time.formatDate(new Date(result.last_online), 'dd MMMM yyyy')}`
        ].join('\n');
        
        const embed = new EmbedBuilder()
          .setColor(10800862)
          .setTimestamp()
          .setAuthor({ name: `${result.username}'s Profile`, iconURL: result.images.jpg.image_url })
          .setDescription(description)
          .addFields([
            { name: 'Anime Stats', value: utils.string.keyValueField(result.statistics.anime), inline: true },
            { name: 'Manga Stats', value: utils.string.keyValueField(result.statistics.manga), inline: true },
            { name: 'Favourite Anime', value: favorites.anime },
            { name: 'Favorite Manga', value: favorites.manga },
            { name: 'Favorite Characters', value: favorites.chars },
            { name: 'Favorite Staffs', value: favorites.people }
          ]);
        
        await i.editReply({ embeds: [embed] });
      } else {
        // Handle AniList
        const { User } = await import("../../assets/graphql");
        const userData = await utils.anilist.fetch(User, { search: username }) as UserData;
        
        if (!userData || userData.errors) {
          if (userData?.errors?.some((code: { status: number }) => code.status >= 500)) {
            return AokiError.API_ERROR({
              sender: i,
              content: "The service is probably dead. Wait a little bit, then try again."
            });
          } else {
            return AokiError.NOT_FOUND({
              sender: i,
              content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
            });
          }
        }
        
        // Format AniList data
        const topFields = Object.entries(userData.User.favourites).map((
          entry: [string, {
            edges: Array<{
              node: {
                title: string | { userPreferred: string, full: string },
                name: string | { userPreferred: string, full: string },
                siteUrl: string
              }
            }>
          }]
        ) => {
          const [query, target] = entry;
          const firstTarget = target.edges.map((entry) => {
            const identifier = entry.node.title || entry.node.name;
            const name = typeof identifier === 'object' ? identifier.userPreferred || identifier.full : identifier;
            return `[**${name}**](${entry.node.siteUrl})`;
          }).join('|') || 'None Listed';
          return `\n**Top 1 ${query}:** ` + firstTarget.split("|")[0];
        });
        
        const description = userData.User.about 
          ? utils.string.textTruncate(utils.string.heDecode(userData.User.about?.replace(/(<([^>]+)>)/g, '') || ''), 250) 
          : "No description provided";
        
        const embed = new EmbedBuilder()
          .setColor(10800862)
          .setTimestamp()
          .setImage(userData.User.bannerImage!)
          .setThumbnail(userData.User.avatar.medium)
          .setTitle(userData.User.name)
          .setURL(userData.User.siteUrl)
          .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
          .setDescription(`***About the user:** ${description}*` + `\n${topFields}`);
        
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
      });
    }
  };
}