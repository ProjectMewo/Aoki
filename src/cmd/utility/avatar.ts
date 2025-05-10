import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createUserOption, 
  Declare, 
  Embed, 
  Options, 
  SubCommand 
} from "seyfert";

const options = {
  user: createUserOption({
    description: 'the user to get the avatar of',
    required: false
  })
};

@Declare({
  name: 'avatar',
  description: 'get the avatar of a user'
})
@Options(options)
export default class Avatar extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    try {
      const user = ctx.options.user ?? ctx.author;

      const avatar = (size: 128 | 256 | 512 | 1024 | 2048) => 
        user.avatarURL({ extension: "png", size });

      const description = [
        `Quality: `,
        `[x128](${avatar(128)}) | `,
        `[x256](${avatar(256)}) | `,
        `[x512](${avatar(512)}) | `,
        `[x1024](${avatar(1024)}) | `,
        `[x2048](${avatar(2048)})`
      ].join("");

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: `${user.username}'s Avatar` })
        .setDescription(description)
        .setImage(avatar(2048))
        .setFooter({
          text: `Requested by ${ctx.author.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.write({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to fetch the avatar. Please try again later."
      });
    }
  }
}