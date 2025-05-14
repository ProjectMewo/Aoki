import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Npm extends Subcommand {
  constructor() {
    super({
      name: 'npm',
      description: 'search for an npm package',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'the package name to search for',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const query = i.options.getString("query")!;
    
    const headers = {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
    };
    
    const raw = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=1`, { headers }).then(res => res.json());
    const res = raw.objects?.[0]?.package;
    
    if (!res) {
      throw new Error("Baka, that's an invalid repository. Or did you make a typo?");
    }
    
    // utilities
    const score = raw.objects[0].score;
    const maintainers = res.maintainers.map((maintainer: { username: string }) => `\`${maintainer.username}\``).join(', ');
    const keywords = res.keywords?.map((keyword: string) => `\`${keyword}\``).join(', ') || "None";
    
    const description = [
      `${i.client.utils.string.textTruncate(res.description, 75)}\n\n`,
      `**Keywords:** ${keywords}\n`,
      `**Maintainers:** ${maintainers}`
    ].join("");
    
    const field = i.client.utils.string.keyValueField({
      "Version": res.version || "Unknown",
      "Author": res.publisher.username,
      "Modified": i.client.utils.time.formatDate(new Date(res.date), 'dd MMMM yyyy'),
      "Score": (score.final * 100).toFixed(1)
    }, 40);
    
    // make embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: "npm Registry", iconURL: 'https://i.imgur.com/24yrZxG.png' })
      .setTitle(`${res.name}`)
      .setURL(`https://www.npmjs.com/package/${res.name}`)
      .setDescription(description)
      .addFields([{ name: "\u2000", value: field }])
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}