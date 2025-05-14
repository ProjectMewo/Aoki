import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  LocalesT
} from "seyfert";

const options = {
  type: createStringOption({
    description: 'The type of content to get',
    description_localizations: {
      "en-US": 'The type of content to get',
      "vi": 'Loại nội dung bạn muốn lấy'
    },
    required: true,
    choices: [
      { name: 'anime', value: 'anime' },
      { name: 'manga', value: 'manga' }
    ]
  })
};

@Declare({
  name: 'random',
  description: 'Get a random anime or manga from MyAnimeList'
})
@LocalesT('anime.random.name', 'anime.random.description')
@Options(options)
export default class Random extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.random;
    const { type } = ctx.options;
    const jikan_v4 = "https://api.jikan.moe/v4";

    await ctx.deferReply();

    try {
      const response = await fetch(`${jikan_v4}/random/${type}`);
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.apiError
        });
      }

      const res = await response.json();
      if (!res.data) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.notFound
        });
      }

      const data = res.data;
      const utils = ctx.client.utils;

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

      const description = [
        utils.string.textTruncate((data.synopsis || '').replace(/(<([^>]+)>)/ig, ''), 350, `...`),
        `\n• **Main Theme:** ${data.themes?.[0]?.name || 'Unspecified'}`,
        `• **Demographics:** ${data.demographics?.[0]?.name || 'Unspecified'}`,
        `• **Air Season:** ${data.season ? utils.string.toProperCase(data.season) : "Unknown"}`,
        `\n*More about the ${type} can be found [here](${data.url}), and the banner can be found [here](${data.images?.jpg.image_url}).*`
      ].join('\n');

      const embed = new Embed()
        .setColor(10800862)
        .setTimestamp()
        .setFooter({ text: `Data sent from MyAnimeList`, iconUrl: ctx.author.avatarURL() })
        .setAuthor({ name: `${data.title}`, iconUrl: data.images?.jpg.image_url })
        .setDescription(description)
        .addFields([
          { name: `${utils.string.toProperCase(type)} Info`, inline: true, value: utils.string.keyValueField(stats, 25) },
          { name: `${utils.string.toProperCase(type)} Scorings`, inline: true, value: utils.string.keyValueField(scores, 25) }
        ]);

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.undocErr
      });
    }
  }
}
