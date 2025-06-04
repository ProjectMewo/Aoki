import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createUserOption, 
  Declare, 
  Embed, 
  Locales, 
  Options, 
  SubCommand 
} from "seyfert";

const options = {
  user: createUserOption({
    description: 'the user to get the avatar of',
    description_localizations: meta.utility.avatar.user,
    required: false
  })
};

@Declare({
  name: 'avatar',
  description: 'get the avatar of a user'
})
@Locales(meta.utility.avatar.loc)
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