import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Options,
  SubCommand
} from "seyfert";

const options = {
  username: createStringOption({
    description: "your osu! username",
    required: true
  }),
  mode: createStringOption({
    description: "your preferred mode",
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
@Options(options)
export default class Set extends SubCommand {
  private usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
  private baseUrl = "https://osu.ppy.sh";
  private api_v1 = `${this.baseUrl}/api`;

  async run(ctx: CommandContext<typeof options>): Promise<void> {
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
        content: "Baka, the username is invalid."
      });
    }

    const profile = await this.findUserByUsername(ctx, username, utils.osu.stringModeFormat(formattedMode));
    if (!profile?.username) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: "Baka, that user doesn't exist."
      });
    }

    // Utilities
    const replies = ["Got that.", "Noted.", "I'll write that in.", "Updated for you.", "One second, writing that in.", "Check if this is right."];
    const reply = `${utils.array.random(replies)} Your current username is \`${profile.username}\`, and your current mode is \`${utils.osu.stringModeFormat(formattedMode)}\`.`;

    // Database check
    if (
      settings.defaultMode && /* entry exists in db */
      settings.inGameName === profile.username && /* ign is the same */
      settings.defaultMode === formattedMode /* mode is the same */
    ) {
      // We don't need to get to the database to save it again
      await ctx.editOrReply({ 
        content: `${reply}\n\nThat's the same thing you did before, though.` 
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