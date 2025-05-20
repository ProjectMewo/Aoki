import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  Locales,
  AutocompleteInteraction
} from "seyfert";

const options = {
  type: createStringOption({
    description: "the type of action to get",
    description_localizations: {
      "en-US": "the type of action to get",
      "vi": "loại hành động cậu muốn lấy"
    },
    required: true,
    autocomplete: async (interaction) => await Action.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: "action",
  description: "get a random anime action image"
})
@Locales({
  name: [
    ['en-US', 'action'],
    ['vi', 'hành-động']
  ],
  description: [
    ['en-US', 'get a random anime action image'],
    ['vi', 'lấy một hình ảnh hành động anime ngẫu nhiên']
  ]
})
@Options(options)
export default class Action extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.anime.action.choices
    );
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.action;
    const { type } = ctx.options;

    await ctx.deferReply();

    try {
      const response = await fetch(`https://waifu.pics/api/sfw/${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch action image.");
      }

      const data = await response.json();

      const embed = new Embed()
        .setDescription(t.desc)
        .setColor(10800862)
        .setImage(data.url)
        .setTimestamp();

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}
