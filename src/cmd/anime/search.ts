import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  EmbedBuilder,
  TextChannel,
  AutocompleteInteraction
} from "discord.js";

export default class Search extends Subcommand {
  constructor() {
    super({
      name: 'search',
      description: 'Search for anime, manga, characters, or people on MyAnimeList',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'type',
          description: 'Content type to search for',
          required: true,
          choices: [
            { name: 'Anime', value: 'anime' },
            { name: 'Manga', value: 'manga' },
            { name: 'Characters', value: 'characters' },
            { name: 'People', value: 'people' }
          ]
        },
        {
          type: 'string',
          name: 'query',
          description: 'Search query',
          required: true,
          isAutocomplete: true
        }
      ]
    });
  };

  async autocomplete(i: AutocompleteInteraction): Promise<void> {
    const type = i.options.getString("type")!;
    const focusedValue = i.options.getFocused().toString();
    const jikan_v4 = "https://api.jikan.moe/v4";

    if (!focusedValue) {
      return await i.respond([]);
    }

    try {
      // Search for content using Jikan API
      const response = await fetch(`${jikan_v4}/${type}?q=${focusedValue}`);
      
      if (!response.ok) {
        return await i.respond([]);
      }
      
      const res = await response.json();
      
      if (!res.data || res.data.length === 0) {
        return await i.respond([]);
      }
      
      // Filter the results
      const nsfw = (i.channel instanceof TextChannel) ? i.channel.nsfw : false;
      const results = res.data.filter((data: any) => {
        let reqName: string;
        if (type === "anime" || type === "manga") {
          reqName = data.title!;
        } else if (type === "characters" || type === "people") {
          reqName = data.name!;
        } else {
          return false;
        }
        
        return reqName.toLowerCase().includes(focusedValue.toLowerCase()) && 
               (nsfw || !data.rating || !["R-17"].includes(data.rating));
      });
      
      // Limit to 25 results and map to autocomplete format
      const limitedResults = results.slice(0, 25).map((data: any) => ({
        name: data.title || data.name, 
        value: data.mal_id.toString()
      }));
      
      await i.respond(limitedResults);
    } catch (error) {
      await i.respond([]);
    }
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const type = i.options.getString("type")!;
    const query = i.options.getString("query")!;
    const jikan_v4 = "https://api.jikan.moe/v4";
    const utils = i.client.utils;
    const channelNSFW = (i.channel instanceof TextChannel) ? i.channel.nsfw : false;
    
    try {
      // Construct appropriate URL for fetching details
      const jikanURL = `${jikan_v4}/${type}/${query}${['characters', 'people'].includes(type) ? "/full" : ""}`;
      const response = await fetch(jikanURL);
      
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: i,
          content: "The service is probably dead. Wait a little bit, then try again."
        });
      }
      
      const res = await response.json();
      
      if (!res.data) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }
      
      const data = res.data;
      
      // Check if content is NSFW but channel isn't
      if ((type === "anime" || type === "manga") &&
          data.rating &&
          ["R-17"].includes(data.rating) &&
          !channelNSFW) {
        return AokiError.NSFW({
          sender: i,
          content: "The content given to me by MyAnimeList has something to do with R-17 content, and I can't show that in this channel, sorry. Get in a NSFW channel, please."
        });
      }
      
      // Handle different content types
      if (type === "anime" || type === "manga") {
        // Create basic embed
        const nsfw = Boolean(data.rating && ["R-17"].includes(data.rating) && data.explicit_genres.length);
        const embed = new EmbedBuilder()
          .setColor(10800862)
          .setTimestamp()
          .setTitle(`${data.title}`)
          .setURL(`${data.url}`)
          .setThumbnail(data.images.jpg.small_image_url)
          .setDescription(
            `*The cover of this ${type} can be found [here](${data.images.jpg.large_image_url})*\n\n` +
            `**Description:** ${utils.string.textTruncate(`${data.synopsis}`, 250, `... *(read more [here](${data.url}))*`)}`
          );
        
        // Add fields based on content type
        const fields = [
          { name: "Type", value: `${utils.string.toProperCase(data.type)}`, inline: true },
          { name: "Status", value: utils.string.toProperCase(`${data.status}`), inline: true },
          { name: "Air Date", value: `${data[type === "anime" ? "aired" : "published"].string}`, inline: true },
          { name: "Avg. Rating", value: `${data.score?.toLocaleString() || "Unknown"}`, inline: true },
          { name: "Age Rating", value: `${data.rating?.replace(")", "") || "Unknown"}`, inline: true },
          { name: "Rating Rank", value: `#${data.rank?.toLocaleString() || "Unknown"}`, inline: true },
          { name: "Popularity", value: `#${data.popularity?.toLocaleString() || "Unknown"}`, inline: true },
        ];
        
        // Add type-specific fields
        if (type === "anime") {
          fields.push(
            { name: "NSFW?", value: utils.string.toProperCase(`${nsfw}`), inline: true },
            { name: "Ep. Count", value: `${data.episodes}`, inline: true }
          );
        } else {
          fields.push(
            { name: "Volume Count", value: `${data.volumes || "Unfinished"}`, inline: true },
            { name: "Chapter Count", value: `${data.chapters || "Unfinished"}`, inline: true }
          );
        }
        
        embed.addFields(fields);
        await i.editReply({ embeds: [embed] });
      } 
      else if (type === "characters") {
        // Helper function to format appearances
        const spreadMap = function(arr: Array<any>, mediaType: string): string {
          if (!arr?.length) return 'None Listed.';
          
          const limitedArr = arr.slice(0, 5);
          const res = utils.string.joinArrayAndLimit(
            limitedArr.map((entry) => {
              const media = entry[mediaType];
              return `[${media[media.title ? "title" : "name"]}](${media.url})`;
            }),
            350,
            ' • '
          );
          
          const remaining = arr.length - limitedArr.length;
          return res.text + (remaining > 0 ? ` and ${remaining} more!` : '') || 'None Listed.';
        };
        
        // Create character embed
        const embed = new EmbedBuilder()
          .setColor(10800862)
          .setTimestamp()
          .setTitle(`${data.name} // ${data.name_kanji || data.name}`)
          .setURL(`${data.url}`)
          .setThumbnail(data.images.jpg.image_url)
          .setDescription(
            `*The portrait of this character can be found [here](${data.images.jpg.image_url})*\n\n` +
            `**About this character:** \n${utils.string.textTruncate(`${data.about || "*They might be a support character, so there's no description about them yet. Maybe you could write one if you like them?*"}`, 500, `... *(read more [here](${data.url}))*`)}`
          )
          .addFields([
            { name: `${data.name} appears in these anime...`, value: spreadMap(data.anime, "anime") },
            { name: `They also appear in these manga...`, value: spreadMap(data.manga, "manga") },
            { name: `They're voiced by...`, value: spreadMap(data.voices, "person") }
          ]);
        
        await i.editReply({ embeds: [embed] });
      } 
      else if (type === "people") {
        // Helper function to format media
        const spreadMap = function(arr: Array<any>, mediaType: string): string {
          if (!arr?.length) return 'None Listed.';
          
          const limitedArr = arr.slice(0, 5);
          const res = utils.string.joinArrayAndLimit(
            limitedArr.map((entry) => {
              return `[${entry[mediaType][entry[mediaType].title ? "title" : "name"]}](${entry[mediaType].url})`;
            }),
            350,
            ' • '
          );
          
          const remaining = arr.length - limitedArr.length;
          return res.text + (remaining > 0 ? ` and ${remaining} more!` : '') || 'None Listed.';
        };
        
        // Create people embed
        const embed = new EmbedBuilder()
          .setColor(10800862)
          .setTimestamp()
          .setTitle(`${data.name}`)
          .setURL(`${data.url}`)
          .setThumbnail(data.images.jpg.image_url)
          .setDescription(
            `*The portrait of ${data.name} can be found [here](${data.images.jpg.image_url})*\n\n` +
            `**About them:** \n${utils.string.textTruncate(`${data.about || "*They might be someone who hasn't been very notable on MyAnimeList yet. Maybe you could write one if you like them?*"}`, 500, `... *(read more [here](${data.url}))*`)}`
          )
          .addFields([
            { name: "Birthdate", value: `${new Date(data.birthday).toLocaleDateString("en-GB") || "Unknown"}`, inline: false },
            { name: "Given Name", value: `${data.given_name || "Unknown"}`, inline: true },
            { name: "Family Name", value: `${data.family_name || "Unknown"}`, inline: true },
            { name: `${data.name} appears in these anime...`, value: spreadMap(data.anime, "anime") },
            { name: `They also appear in these manga...`, value: spreadMap(data.manga, "manga") },
            { name: `They voice these characters...`, value: spreadMap(data.voices, "character") }
          ]);
        
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