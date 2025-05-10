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
  query: createStringOption({
    description: 'the URL to take a screenshot of',
    required: true
  })
};

@Declare({
  name: 'screenshot',
  description: 'take a screenshot of a website'
})
@Options(options)
export default class Screenshot extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { query } = ctx.options;

    await ctx.deferReply();

    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    if (!query.match(urlRegex)) {
      throw new Error("Baka, that's not a valid URL.\n\nMake sure it starts with either `https://` or `http://`.");
    }

    const nsfwPages = await ctx.client.utils.profane.getStatic("nsfw");

    if (nsfwPages.domains.includes(query) && !(ctx.interaction.channel as any).nsfw) {
      return AokiError.GENERIC({
        sender: ctx.interaction,
        content: "That's a NSFW website, you moron!"
      });
    }

    // Take screenshot
    try {
      const url = [
        `https://api.screenshotone.com/take?`,
        `access_key=${process.env.SCREENSHOT_KEY}&`,
        `url=${query}&`,
        `format=jpg&`,
        `block_ads=true&`,
        `block_cookie_banners=true&`,
        `block_trackers=true&`,
        `timeout=10`
      ].join("");

      const response = await fetch(url);
      if (!response.ok) {
        return AokiError.GENERIC({
          sender: ctx.interaction,
          content: "Failed to fetch screenshot. Please try again later."
        });
      }

      const buffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(new Uint8Array(buffer));
      const attachment = {
        data: imageBuffer,
        filename: 'screenshot.png'
      };

      const embed = new Embed()
        .setColor(10800862)
        .setImage("attachment://screenshot.png")
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({
        embeds: [embed],
        files: [attachment]
      });
    } catch {
      return AokiError.GENERIC({
        sender: ctx.interaction,
        content: "Something's wrong with that URL. Check if you made a typo."
      });
    }
  }
}