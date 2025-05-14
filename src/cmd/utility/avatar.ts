import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createUserOption, 
  Declare, 
  Embed, 
  LocalesT, 
  Options, 
  SubCommand 
} from "seyfert";

const options = {
  user: createUserOption({
    description: 'the user to get the avatar of',
    description_localizations: {
      "en-US": 'the user to get the avatar of',
      "vi": 'người dùng mà bạn muốn lấy ảnh đại diện'
    },
    required: false
  })
};

@Declare({
  name: 'avatar',
  description: 'get the avatar of a user'
})
@LocalesT('utility.avatar.name', 'utility.avatar.description')
@Options(options)
export default class Avatar extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.avatar;
    try {
      const user = ctx.options.user ?? ctx.author;

      const avatar = (size: 128 | 256 | 512 | 1024 | 2048) => 
        user.avatarURL({ size });

      const description = [
        t.quality,
        `[x128](${avatar(128)}) | `,
        `[x256](${avatar(256)}) | `,
        `[x512](${avatar(512)}) | `,
        `[x1024](${avatar(1024)}) | `,
        `[x2048](${avatar(2048)})`
      ].join("");

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: t.author(user.username) })
        .setDescription(description)
        .setImage(avatar(2048))
        .setFooter({
          text: t.requestedBy(ctx.author.username),
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.write({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.fetchError
      });
    }
  }
}