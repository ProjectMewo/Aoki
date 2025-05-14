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
  query: createStringOption({
    description: 'the library name to search for',
    description_localizations: {
      "en-US": 'the library name to search for',
      "vi": 'tên thư viện cậu muốn tìm kiếm'
    },
    required: true
  })
};

@Declare({
  name: 'npm',
  description: 'search for an npm library'
})
@LocalesT('utility.npm.name', 'utility.npm.description')
@Options(options)
export default class Npm extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.npm;
    const { query } = ctx.options;

    await ctx.deferReply();

    try {
      const headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
      };

      const raw = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=1`, { headers }).then(res => res.json());
      const res = raw.objects?.[0]?.package;

      if (!res) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.repoNotFound
        })
      }

      const score = raw.objects[0].score;
      const maintainers = res.maintainers.map((maintainer: { username: string }) => `\`${maintainer.username}\``).join(', ');
      const keywords = res.keywords?.map((keyword: string) => `\`${keyword}\``).join(', ') || t.none;

      const description = [
        `${ctx.client.utils.string.textTruncate(res.description, 75)}\n\n`,
        `**${t.keyword}:** ${keywords}\n`,
        `**${t.maintainer}:** ${maintainers}`
      ].join("");

      const field = ctx.client.utils.string.keyValueField({
        [t.ver]: res.version || t.none,
        [t.author]: res.publisher.username,
        [t.modified]: ctx.client.utils.time.formatDate(new Date(res.date), 'dd MMMM yyyy'),
        [t.score]: (score.final * 100).toFixed(1)
      }, 40);

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: t.registry, iconUrl: 'https://i.imgur.com/24yrZxG.png' })
        .setTitle(`${res.name}`)
        .setURL(`https://www.npmjs.com/package/${res.name}`)
        .setDescription(description)
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