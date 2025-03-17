import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import Pagination from "@struct/Paginator";
import { 
  ChatInputCommandInteraction, 
  EmbedBuilder,
  TextChannel
} from "discord.js";

export default class Airing extends Subcommand {
  constructor() {
    super({
      name: 'airing',
      description: 'Get a list of anime airing on a specific day',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'day',
          description: 'Day of the week',
          required: true,
          choices: [
            { name: 'Sunday', value: 'sunday' },
            { name: 'Monday', value: 'monday' },
            { name: 'Tuesday', value: 'tuesday' },
            { name: 'Wednesday', value: 'wednesday' },
            { name: 'Thursday', value: 'thursday' },
            { name: 'Friday', value: 'friday' },
            { name: 'Saturday', value: 'saturday' }
          ]
        }
      ]
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const day = i.options.getString("day")!;
    const channelNSFW = (i.channel instanceof TextChannel) ? i.channel.nsfw : false;
    
    try {
      const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}${channelNSFW ? "" : "&sfw=true"}`);
      
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: i,
          content: "The service is probably dead. Wait a little bit, then try again."
        });
      }
      
      const res = await response.json();
      
      if (!res.data || res.data.length === 0) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }
      
      // Set up pagination
      const utils = i.client.utils;
      const elapsed = Date.now() - i.createdTimestamp;
      
      // Create pages for pagination
      const pages = new Pagination();
      
      for (const data of res.data) {
        const description = [
          `${data.score ? `**Score**: ${data.score}\n` : ''}`,
          `${data.genres.map((x: { name: string, url: string }) => 
            `[${x.name}](${x.url})`).join(' • ')}\n\n`,
          `${data.synopsis ? utils.string.textTruncate(data.synopsis, 300, `... *(read more [here](${data.url}))*`) : "*No synopsis available*"}`
        ].join("");
        
        const footer = [
          `Search duration: ${Math.abs(elapsed / 1000).toFixed(2)} seconds`,
          `Page ${pages.size + 1} of ${res.data.length}`,
          `Data sent from MyAnimeList`
        ].join(" | ");
        
        const fields = [
          { name: 'Type', value: `${data.type || 'Unknown'}`, inline: true },
          { name: 'Started', value: `${new Date(data.aired.from).toISOString().substring(0, 10)}`, inline: true },
          { name: 'Source', value: `${data.source || 'Unknown'}`, inline: true },
          {
            name: 'Producers', value: `${data.producers.map((x: { name: string, url: string }) => 
              `[${x.name}](${x.url})`).join(' • ') || 'None'}`, inline: true
          },
          { name: 'Licensors', value: `${data.licensors.join(' • ') || 'None'}`, inline: true },
          { name: '\u200b', value: '\u200b', inline: true }
        ];
        
        const page = new EmbedBuilder()
          .setColor(10800862)
          .setThumbnail(data.images.jpg.image_url)
          .setDescription(description)
          .setAuthor({ name: `${data.title}`, url: data.url })
          .setFooter({ text: footer, iconURL: i.user.displayAvatarURL() })
          .addFields(fields);
          
        pages.add(page);
      }
      
      // Send initial message with first page
      const msg = await i.editReply({ embeds: [pages.firstPage] });
      
      pages.handle({
        sender: msg,
        filter: 'userOnly',
        time: 90000
      });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
      });
    }
  };
}