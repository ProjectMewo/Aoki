import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder, TextChannel } from "discord.js";

export default class Urban extends Subcommand {
  constructor() {
    super({
      name: 'urban',
      description: 'search for a definition on Urban Dictionary',
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
      throw new Error("Your query has some profanity in there.\n\nEither get into a NSFW channel, or change your query.");
    }
    
    const headers = {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
    };
    
    const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${query}`, { headers }).then(res => res.json());
    
    if (!res?.list?.length) {
      throw new Error("Hmph, seems like there's no definition for that. Even on Urban Dictionary.\n\nYou know what that means.");
    }
    
    const definition = res.list[0];
    const nsfw = (i.channel as TextChannel).nsfw;
    
    const truncateText = async (text: string, maxLength: number): Promise<string> => {
      const cleanedText = nsfw ? text : await i.client.utils.profane.cleanProfane(text);
      return i.client.utils.string.textTruncate(cleanedText, maxLength);
    };
    
    const definitionText = await truncateText(definition.definition, 1000);
    const exampleText = await truncateText(definition.example || 'N/A', 1000);
    const authorText = await truncateText(definition.author || 'N/A', 250);
    
    const fields = {
      definition: '```fix\n' + definitionText + '\n```',
      example: '```fix\n' + exampleText + '\n```',
      author: '```fix\n' + authorText + '\n```'
    };
    
    // make embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setTitle(`Definition of ${definition.word}`)
      .setURL(definition.urbanURL)
      .addFields([
        { name: '...is', value: fields.definition },
        { name: 'Examples', value: fields.example },
        { name: 'Submitted by', value: fields.author },
        { name: 'Profane Word?', value: 'Yell at my sensei through `/my fault`, the patch should be added in a few working days.' }
      ])
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}