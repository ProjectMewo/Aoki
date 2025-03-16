import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";

export default class Wiki extends Subcommand {
  constructor() {
    super({
      name: 'wiki',
      description: 'search for information on Wikipedia',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'the term to search for',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const query = i.options.getString("query")!;
    
    if (await i.client.utils.profane.isProfane(query) && !(i.channel as TextChannel).nsfw) {
      throw new Error("Your query has something to do with profanity, baka.\n\nEither move to a NSFW channel, or change the query.");
    }
    
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`).then(async res => await res.json());
    
    if (!res?.title) {
      throw new Error("Can't find that. Check your query.");
    }
    
    const timestamp = new Date(res.timestamp);
    const thumbnail = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png";
    
    const description = [
      `***Description:** ${res.description || "None"}*\n\n`,
      `**Extract:** ${i.client.utils.string.textTruncate(res.extract, 1000).split(". ").join(".\n- ")}`
    ].join("");
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setTimestamp(timestamp)
      .setTitle(res.title)
      .setThumbnail(thumbnail)
      .setURL(res.content_urls.desktop.page)
      .setDescription(description)
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() });
      
    await i.editReply({ embeds: [embed] });
  }
}