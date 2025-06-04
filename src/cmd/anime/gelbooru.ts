import AokiError from "@struct/AokiError";
import Pagination from "@struct/Paginator";
import GelbooruResponse from "@local-types/gelbooru";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  TextGuildChannel, 
  Locales
} from "seyfert";
import { meta } from "@assets/cmdMeta";

const options = {
  tags: createStringOption({
    description: 'tags to search for (separate with spaces)',
    description_localizations: meta.anime.gelbooru.tags,
    required: true
  }),
  rating: createStringOption({
    description: 'rating of the images. Default safe.',
    description_localizations: meta.anime.gelbooru.rating,
    required: false,
    choices: [
      { name: 'Safe', value: 'general' },
      { name: 'Questionable', value: 'questionable' },
      { name: 'Sensitive', value: 'sensitive' },
      { name: 'Explicit', value: 'explicit' }
    ]
  })
};

@Declare({
  name: 'gelbooru',
  description: 'search for anime images on Gelbooru'
})
@Locales(meta.anime.gelbooru.loc)
@Options(options)
export default class Gelbooru extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.gelbooru;
    const { tags, rating } = ctx.options;
    const channelNSFW = (ctx.interaction.channel as TextGuildChannel).nsfw;

    if (!channelNSFW) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noSfw
      });
    }

    const searchTags = `${tags.trim()} rating:${rating || 'general'}`;

    await ctx.deferReply();

    try {
      const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=25&tags=${encodeURIComponent(searchTags)}${process.env.GELBOORU_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.apiError
        });
      }

      const data = await response.json() as GelbooruResponse;

      if (!data.post || data.post.length === 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.notFound
        });
      }

      const embeds = data.post.map((post, index) => {
        const tagList = post.tags.split(' ').slice(0, 10).map(tag => `\`${tag}\``).join(', ');
        const additionalTags = post.tags.split(' ').length > 10 ? `... and ${post.tags.split(' ').length - 10} more` : '';
        const titleTags = tags.length > 50 ? tags.slice(0, 50) + '...' : tags;

        return new Embed()
          .setTitle(`${t.search}: ${titleTags}`)
          .setURL(`https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`)
          .setColor(10800862)
          .setImage(post.file_url)
          .addFields(
            { name: t.score, value: post.score.toString(), inline: true },
            { name: t.rating, value: ctx.client.utils.string.toProperCase(post.rating), inline: true },
            { name: t.tags, value: `${tagList}${additionalTags ? `\n${additionalTags}` : ''}` }
          )
          .setFooter({ text: `${t.page} ${index + 1}/${data.post.length}` })
          .setTimestamp();
      });

      const paginator = new Pagination(...embeds);
      await paginator.handle({
        sender: ctx.interaction,
        filter: 'userOnly',
        time: 300000 // 5 minutes
      });
    } catch (error) {
      console.error('Gelbooru error:', error);
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}
