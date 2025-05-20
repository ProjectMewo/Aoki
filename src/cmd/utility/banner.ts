import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createUserOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  Locales
} from "seyfert";

const options = {
  user: createUserOption({
    description: "the user to get the banner of",
    description_localizations: {
      "en-US": "the user to get the banner of",
      "vi": "người dùng mà cậu muốn lấy biểu ngữ"
    },
    required: false
  })
};

@Declare({
  name: "banner",
  description: "get the banner of a user"
})
@Locales({
  name: [
    ['en-US', 'banner'],
    ['vi', 'biểu-ngữ']
  ],
  description: [
    ['en-US', 'get the banner of a user'],
    ['vi', 'lấy biểu ngữ của một người dùng']
  ]
})
@Options(options)
export default class Banner extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.banner;
    const user = ctx.options.user || ctx.author;

    await ctx.deferReply();

    try {
      const fetched = await user.fetch();
      const banner = fetched.banner;

      if (!banner) {
        return AokiError.GENERIC({
          sender: ctx.interaction,
          content: t.noBanner
        });
      }

      const bannerURL = (size: 128 | 256 | 512 | 1024 | 2048) =>
        user.bannerURL({ size });

      const description = [
        t.quality,
        `[x128](${bannerURL(128)}) | `,
        `[x256](${bannerURL(256)}) | `,
        `[x512](${bannerURL(512)}) | `,
        `[x1024](${bannerURL(1024)}) | `,
        `[x2048](${bannerURL(2048)})`
      ].join("");

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: t.author(user.username) })
        .setDescription(description)
        .setImage(bannerURL(2048)!)
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