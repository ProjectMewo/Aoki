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
  query: createStringOption({
    description: 'the URL to take a screenshot of',
    description_localizations: {
      "en-US": 'the URL to take a screenshot of',
      "vi": 'URL để chụp ảnh màn hình'
    },
    required: true
  })
};

@Declare({
  name: 'screenshot',
  description: 'take a screenshot of a website'
})
@Locales({
  name: [
    ['en-US', 'screenshot'],
    ['vi', 'chụp-ảnh-màn-hình']
  ],
  description: [
    ['en-US', 'take a screenshot of a website'],
    ['vi', 'chụp ảnh màn hình của một trang web']
  ]
})
@Options(options)
export default class Screenshot extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.screenshot;
    const { query } = ctx.options;

    await ctx.deferReply();

    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

    if (!query.match(urlRegex)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.urlError
      })
    }

    const nsfwPages = await ctx.client.utils.profane.getStatic("profane", "en-US");

    const trimmedQuery = new URL(query).hostname;

    if (nsfwPages.domains.includes(trimmedQuery) && !(ctx.interaction.channel as any).nsfw) {
      return AokiError.GENERIC({
        sender: ctx.interaction,
        content: t.noNsfw
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
        return AokiError.API_ERROR({
          sender: ctx.interaction,
          content: t.fetchError
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
          text: t.requestedBy(ctx.author.username),
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
        content: t.fetchError
      });
    }
  }
}