import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  user: createStringOption({
    description: 'the GitHub username',
    required: true
  }),
  repo: createStringOption({
    description: 'the repository name',
    required: true
  })
};

@Declare({
  name: 'github',
  description: 'get information about a GitHub repository'
})
@Options(options)
export default class Github extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { user, repo } = ctx.options;

    await ctx.deferReply();

    try {
      const headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
      };

      const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers }).then(res => res.json());

      if (!res?.id) {
        throw new Error("Baka, that repo doesn't exist.");
      }

      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', "PB", 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))}${sizes[i]}`;
      };

      const icon = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
      const size = formatBytes(res.size);
      const license = res.license?.name || "Unknown";

      const field = ctx.client.utils.string.keyValueField({
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

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: "GitHub", iconUrl: icon })
        .setTitle(`${user}/${repo}`)
        .setURL(res.html_url)
        .setThumbnail(res.owner.avatar_url)
        .setDescription(`${res.description}\n\n`)
        .addFields([{ name: "\u2000", value: field }])
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to fetch repository information. Please try again later."
      });
    }
  }
}