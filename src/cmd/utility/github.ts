import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Github extends Subcommand {
  constructor() {
    super({
      name: 'github',
      description: 'get information about a GitHub repository',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'user',
          description: 'the github username',
          required: true
        },
        {
          type: 'string',
          name: 'repo',
          description: 'the repository name',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getString("user")!;
    const repo = i.options.getString("repo")!;
    
    const headers = {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
    };
    
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers }).then(res => res.json());
    
    if (!res?.id) {
      throw new Error("Baka, that repo doesn't exist.");
    }
    
    // utilities
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0B';
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', "PB", 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))}${sizes[i]}`;
    };
    
    const icon = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    const size = formatBytes(res.size);
    const license = res.license?.name || "Unknown";
    
    const field = i.client.utils.string.keyValueField({
      "Language": res.language || "Unknown",
      "Forks": res.forks_count.toLocaleString(),
      "License": license,
      "Open Issues": res.open_issues.toLocaleString(),
      "Watchers": res.subscribers_count.toLocaleString(),
      "Stars": res.stargazers_count.toLocaleString(),
      "Size": size,
      "Archived?": res.archived ? "Yes" : "No",
      "Disabled?": res.disabled ? "Yes" : "No",
      "Forked?": res.fork ? "Yes" : "No"
    }, 30);
    
    // make embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: "GitHub", iconURL: icon })
      .setTitle(`${user}/${repo}`)
      .setURL(res.html_url)
      .setThumbnail(res.owner.avatar_url)
      .setDescription(`${res.description}\n\n`)
      .addFields([{ name: "\u2000", value: field }])
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}