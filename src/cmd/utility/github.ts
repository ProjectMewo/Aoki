import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  Locales
} from "seyfert";

const options = {
  user: createStringOption({
    description: 'the GitHub username',
    description_localizations: {
      "en-US": 'the GitHub username',
      "vi": 'tên người dùng GitHub'
    },
    required: true
  }),
  repo: createStringOption({
    description: 'the repository name',
    description_localizations: {
      "en-US": 'the repository name',
      "vi": 'tên repository'
    },
    required: true
  })
};

@Declare({
  name: 'github',
  description: 'get information about a GitHub repository'
})
@Locales({
  name: [
    ['en-US', 'github'],
    ['vi', 'github']
  ],
  description: [
    ['en-US', 'get information about a GitHub repository'],
    ['vi', 'lấy thông tin về một repository trên GitHub']
  ]
})
@Options(options)
export default class Github extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.github;
    const { user, repo } = ctx.options;

    await ctx.deferReply();

    try {
      const headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
      };

      const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers }).then(res => res.json());

      if (!res?.id) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.repoNotFound
        });
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

      const field = t.field(res, license, size, ctx);

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: "GitHub", iconUrl: icon })
        .setTitle(`${user}/${repo}`)
        .setURL(res.html_url)
        .setThumbnail(res.owner.avatar_url)
        .setDescription(`${res.description}\n\n`)
        .addFields([{ name: "\u2000", value: field }])
        .setFooter({
          text: t.requestedBy(ctx.author.username),
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.fetchError
      });
    }
  }
}