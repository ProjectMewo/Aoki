import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  LocalesT,
  Options,
  SubCommand
} from "seyfert";

const options = {
  username: createStringOption({
    description: "your osu! username",
    description_localizations: {
      "en-US": "your osu! username",
      "vi": "tên người dùng osu! của bạn"
    },
    required: true
  }),
  mode: createStringOption({
    description: "your preferred mode",
    description_localizations: {
      "en-US": "your preferred mode",
      "vi": "chế độ bạn muốn đặt làm mặc định"
    },
    required: true,
    choices: [
      { name: "osu!standard", value: "osu" },
      { name: "osu!taiko", value: "taiko" },
      { name: "osu!catch", value: "fruits" },
      { name: "osu!mania", value: "mania" }
    ]
  })
};

@Declare({
  name: "set",
  description: "set your osu! username and default mode"
})
@LocalesT('osu.set.name', 'osu.set.description')
@Options(options)
export default class Set extends SubCommand {
  private usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
  private baseUrl = "https://osu.ppy.sh";
  private api_v1 = `${this.baseUrl}/api`;

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.set;
    const { username, mode } = ctx.options;
    const utils = ctx.client.utils;

    await ctx.deferReply();

    const formattedMode = utils.osu.numberModeFormat(mode);

    // Handle exceptions
    const settings = ctx.author.settings;
    if (!settings) await ctx.author.update({ inGameName: "", defaultMode: 0 });
    if (!this.usernameRegex.test(username)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidUsername
      });
    }

    const profile = await this.findUserByUsername(ctx, username, utils.osu.stringModeFormat(formattedMode));
    if (!profile?.username) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.userNotFound
      });
    }

    // Utilities
    const reply = t.updated(profile.username, utils.osu.stringModeFormat(formattedMode));

    // Database check
    if (
      settings.defaultMode && /* entry exists in db */
      settings.inGameName === profile.username && /* ign is the same */
      settings.defaultMode === formattedMode /* mode is the same */
    ) {
      // We don't need to get to the database to save it again
      await ctx.editOrReply({ 
        content: `${reply}\n\n${t.sameAsBefore}` 
      });
      return;
    }

    // Save to database
    await ctx.author.update({ inGameName: profile.username, defaultMode: formattedMode });
    await ctx.editOrReply({ content: reply });
  }

  private async findUserByUsername(ctx: CommandContext<typeof options>, username: string, mode: string) {
    try {
      const response = await fetch([
        `${this.api_v1}/get_user?`,
        `k=${process.env["OSU_KEY"]!}&`,
        `u=${username}&`,
        `m=${ctx.client.utils.osu.numberModeFormat(mode)}`
      ].join(""));
      const data = await response.json();
      return data[0];
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }
}