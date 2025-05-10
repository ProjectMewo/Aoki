import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createUserOption,
  Declare,
  Embed,
  SubCommand,
  Options
} from "seyfert";

const options = {
  user: createUserOption({
    description: "the user to get the banner of",
    required: false
  })
};

@Declare({
  name: "banner",
  description: "get the banner of a user"
})
@Options(options)
export default class Banner extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const user = ctx.options.user || ctx.author;

    await ctx.deferReply();

    try {
      const fetched = await user.fetch();
      const banner = fetched.banner;

      if (!banner) {
        return AokiError.GENERIC({
          sender: ctx.interaction,
          content: "They don't have Nitro as a user, or the developer hasn't configured a banner for that application."
        });
      }

      const bannerURL = (size: 128 | 256 | 512 | 1024 | 2048) =>
        user.bannerURL({ extension: "png", size });

      const description = [
        `Quality: `,
        `[x128](${bannerURL(128)}) | `,
        `[x256](${bannerURL(256)}) | `,
        `[x512](${bannerURL(512)}) | `,
        `[x1024](${bannerURL(1024)}) | `,
        `[x2048](${bannerURL(2048)})`
      ].join("");

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: `${user.username}'s Banner` })
        .setDescription(description)
        .setImage(bannerURL(2048)!)
        .setFooter({
          text: `Requested by ${ctx.author.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to fetch the user's banner. Please try again later."
      });
    }
  }
}