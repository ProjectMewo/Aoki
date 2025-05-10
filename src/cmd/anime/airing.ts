import AokiError from "@struct/AokiError";
import Pagination from "@struct/Paginator";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed,
  SubCommand, 
  Options, 
  TextGuildChannel
} from "seyfert";

const options = {
  day: createStringOption({
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
  })
};

@Declare({
  name: 'airing',
  description: 'Get a list of anime airing on a specific day'
})
@Options(options)
export default class Airing extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { day } = ctx.options;
    const channelNSFW = (ctx.interaction.channel as TextGuildChannel).nsfw;

    await ctx.deferReply();

    try {
      const response = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}${channelNSFW ? "" : "&sfw=true"}`);
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: "The service is probably dead. Wait a little bit, then try again."
        });
      }

      const res = await response.json();
      if (!res.data || res.data.length === 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }

      const elapsed = Date.now() - ctx.interaction.createdTimestamp;
      const pages = res.data.map((data: any, index: number) => {
        const description = [
          `${data.score ? `**Score**: ${data.score}\n` : ''}`,
          `${data.genres.map((x: { name: string, url: string }) => 
            `[${x.name}](${x.url})`).join(' • ')}\n\n`,
          `${data.synopsis ? ctx.client.utils.string.textTruncate(data.synopsis, 300, `... *(read more [here](${data.url}))*`) : "*No synopsis available*"}`
        ].join("");

        const footer = [
          `Search duration: ${Math.abs(elapsed / 1000).toFixed(2)} seconds`,
          `Page ${index + 1} of ${res.data.length}`,
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

        return new Embed()
          .setColor(10800862)
          .setThumbnail(data.images.jpg.image_url)
          .setDescription(description)
          .setAuthor({ name: `${data.title}`, url: data.url })
          .setFooter({ text: footer, iconUrl: ctx.author.avatarURL() })
          .addFields(fields);
      });

      const paginator = new Pagination(pages);
      await paginator.handle({
        sender: ctx.interaction,
        filter: 'userOnly',
        time: 60000
      });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
      });
    }
  }
}
