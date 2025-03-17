import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Random extends Subcommand {
  constructor() {
    super({
      name: 'random',
      description: 'Get a random anime or manga from MyAnimeList',
      permissions: [],
      options: [{
        type: 'string',
        name: 'type',
        description: 'The type of content to get',
        required: true,
        choices: [
          { name: 'anime', value: 'anime' },
          { name: 'manga', value: 'manga' }
        ]
      }]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const type = i.options.getString("type")!;
    const jikan_v4 = "https://api.jikan.moe/v4";
    
    try {
      const response = await fetch(`${jikan_v4}/random/${type}`);
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
      
      // Processing the API response
      const data = res.data;
      const utils = i.client.utils;
      
      // Format stats based on the content type
      const stats = {
        "Main Genre": data.genres?.[0]?.name || "No data",
        ...(type === "anime") ?
          {
            "Source": data.source || "No data",
            "Episodes": data.episodes || "No data",
            "Status": data.status || "No data",
            "Schedule": data.broadcast?.day ? `${data.broadcast.day}s` : "No data",
            "Duration": data.duration?.replace(/ per /g, "/") || "No data"
          } : {
            "Chapters": data.chapters || "No data",
            "Volumes": data.volumes || "No data"
          }
      };
      
      // Format scores
      const scores = {
        "Mean Rank": data.rank || "No data",
        "Popularity": data.popularity || "No data",
        "Favorites": data.favorites || "No data",
        "Subscribed": data.members || "No data",
        ...(type === "anime") ?
          {
            "Average Score": data.score || "No data",
            "Scored By": data.scored_by || "No data",
          } : {}
      };
      
      // Create description
      const description = [
        utils.string.textTruncate((data.synopsis || '').replace(/(<([^>]+)>)/ig, ''), 350, `...`),
        `\n• **Main Theme:** ${data.themes?.[0]?.name || 'Unspecified'}`,
        `• **Demographics:** ${data.demographics?.[0]?.name || 'Unspecified'}`,
        `• **Air Season:** ${data.season ? utils.string.toProperCase(data.season) : "Unknown"}`,
        `\n*More about the ${type} can be found [here](${data.url}), and the banner can be found [here](${data.images?.jpg.image_url}).*`
      ].join('\n');
      
      // Create and send embed
      const embed = new EmbedBuilder()
        .setColor(10800862)
        .setTimestamp()
        .setFooter({ text: `Data sent from MyAnimeList`, iconURL: i.user.displayAvatarURL() })
        .setAuthor({ name: `${data.title}`, iconURL: data.images?.jpg.image_url })
        .setDescription(description)
        .addFields([
          { name: `${utils.string.toProperCase(type)} Info`, inline: true, value: utils.string.keyValueField(stats, 25) },
          { name: `${utils.string.toProperCase(type)} Scorings`, inline: true, value: utils.string.keyValueField(scores, 25) }
        ]);
      
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
      });
    }
  };
}