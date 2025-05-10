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
  type: createStringOption({
    description: "The type of action to get",
    required: true,
    choices: [
      { name: "waifu", value: "waifu" },
      { name: "neko", value: "neko" },
      { name: "shinobu", value: "shinobu" },
      { name: "megumin", value: "megumin" },
      { name: "bully", value: "bully" },
      { name: "cuddle", value: "cuddle" },
      { name: "cry", value: "cry" },
      { name: "hug", value: "hug" },
      { name: "awoo", value: "awoo" },
      { name: "kiss", value: "kiss" },
      { name: "lick", value: "lick" },
      { name: "pat", value: "pat" },
      { name: "smug", value: "smug" },
      { name: "bonk", value: "bonk" },
      { name: "yeet", value: "yeet" },
      { name: "blush", value: "blush" },
      { name: "smile", value: "smile" },
      { name: "wave", value: "wave" },
      { name: "highfive", value: "highfive" },
      { name: "handhold", value: "handhold" },
      { name: "nom", value: "nom" },
      { name: "bite", value: "bite" },
      { name: "glomp", value: "glomp" },
      { name: "slap", value: "slap" },
      { name: "kick", value: "kick" }
    ]
  })
};

@Declare({
  name: "action",
  description: "Get a random anime action image"
})
@Options(options)
export default class Action extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { type } = ctx.options;

    await ctx.deferReply();

    try {
      const response = await fetch(`https://waifu.pics/api/sfw/${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch action image.");
      }

      const data = await response.json();

      const embed = new Embed()
        .setColor(10800862)
        .setImage(data.url)
        .setTimestamp();

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "There was an error getting that image. Try again later, or my sensei probably messed up."
      });
    }
  }
}
