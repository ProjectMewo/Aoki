import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import Pagination from "@struct/Paginator";

interface GelbooruPost {
  id: number;
  created_at: string;
  score: number;
  width: number;
  height: number;
  md5: string;
  directory: string;
  image: string;
  rating: string;
  source: string;
  change: number;
  owner: string;
  creator_id: number;
  parent_id: number;
  sample: number;
  preview_height: number;
  preview_width: number;
  tags: string;
  title: string;
  has_notes: string;
  has_comments: string;
  file_url: string;
  preview_url: string;
  sample_url: string;
  sample_height: number;
  sample_width: number;
  status: string;
  post_locked: number;
  has_children: string;
}

interface GelbooruResponse {
  post: GelbooruPost[];
  '@attributes': {
    limit: number;
    offset: number;
    count: number;
  };
}

export default class Gelbooru extends Subcommand {
  constructor() {
    super({
      name: 'gelbooru',
      description: 'Search for anime images on Gelbooru',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'tags',
          description: 'Tags to search for (separate with spaces)',
          required: true,
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    // Check if the command is used in an NSFW channel
    if (i.channel?.isTextBased() && !(i.channel as TextChannel).nsfw) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "This command can only be used in channels marked as NSFW."
      });
    }
    
    const tags = i.options.getString("tags")!.trim();
    
    try {
      // Fetch images from Gelbooru
      const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=25&tags=${encodeURIComponent(tags)}${process.env.GELBOORU_KEY}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: i,
          content: "There was an error fetching images from Gelbooru. Try again later."
        });
      }
      
      const data = await response.json() as GelbooruResponse;
      
      // Check if there are any results
      if (!data.post || data.post.length === 0) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "No results found for those tags. Try different tags."
        });
      }

      // Create embeds for each post
      const embeds = data.post.map((post, index) => {
        // Filter tags for display (limit length)
        const tagList = post.tags.split(' ').slice(0, 10).map(tag => `\`${tag}\``).join(', ');
        const additionalTags = post.tags.split(' ').length > 10 ? `... and ${post.tags.split(' ').length - 10} more` : '';
        
        return new EmbedBuilder()
          .setTitle(`Gelbooru Search: ${tags}`)
          .setURL(`https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`)
          .setColor(10800862)
          .setImage(post.file_url)
          .addFields(
            { name: 'Score', value: post.score.toString(), inline: true },
            { name: 'Rating', value: post.rating === 's' ? 'Safe' : post.rating === 'q' ? 'Questionable' : 'Explicit', inline: true },
            { name: 'Tags', value: `${tagList}${additionalTags ? `\n${additionalTags}` : ''}` }
          )
          .setFooter({ text: `Page ${index + 1}/${data.post.length}` })
          .setTimestamp();
      });
      
      // Create pagination instance
      const paginator = new Pagination(...embeds);
      
      // Handle pagination
      await paginator.handle({
        sender: i,
        filter: 'userOnly',
        time: 300000,
      });
      
    } catch (error) {
      console.error('Gelbooru error:', error);
      return AokiError.API_ERROR({
        sender: i,
        content: "There was an error processing your request. Please try again later."
      });
    }
  }
}