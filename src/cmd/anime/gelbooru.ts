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
  TextGuildChannel 
} from "seyfert";

const options = {
  tags: createStringOption({
    description: 'Tags to search for (separate with spaces)',
    required: true
  }),
  rating: createStringOption({
    description: 'Rating of the images. Default safe.',
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
  description: 'Search for anime images on Gelbooru'
})
@Options(options)
export default class Gelbooru extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { tags, rating } = ctx.options;
    const channelNSFW = (ctx.interaction.channel as TextGuildChannel).nsfw;

    if (!channelNSFW) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "This command can only be used in channels marked as NSFW."
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
          content: "There was an error fetching images from Gelbooru. Try again later."
        });
      }

      const data = await response.json() as GelbooruResponse;

      if (!data.post || data.post.length === 0) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: "No results found for those tags. Try different tags."
        });
      }

      const embeds = data.post.map((post, index) => {
        const tagList = post.tags.split(' ').slice(0, 10).map(tag => `\`${tag}\``).join(', ');
        const additionalTags = post.tags.split(' ').length > 10 ? `... and ${post.tags.split(' ').length - 10} more` : '';
        const titleTags = tags.length > 50 ? tags.slice(0, 50) + '...' : tags;

        return new Embed()
          .setTitle(`Gelbooru Search: ${titleTags}`)
          .setURL(`https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`)
          .setColor(10800862)
          .setImage(post.file_url)
          .addFields(
            { name: 'Score', value: post.score.toString(), inline: true },
            { name: 'Rating', value: ctx.client.utils.string.toProperCase(post.rating), inline: true },
            { name: 'Tags', value: `${tagList}${additionalTags ? `\n${additionalTags}` : ''}` }
          )
          .setFooter({ text: `Page ${index + 1}/${data.post.length}` })
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
        content: "There was an error processing your request. Please try again later."
      });
    }
  }
}
