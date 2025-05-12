import {
  CommandContext,
  Declare,
  SubCommand
} from "seyfert";

@Declare({
  name: "toggle",
  description: "toggle the verification system for this server"
})
export default class Toggle extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const currentStatus = guild.settings.verification.status || false;

    await ctx.deferReply();

    if (!currentStatus) {
      await guild.update({ verification: { status: true } });
      await ctx.editOrReply({ content: "The verification system has been enabled." });
    } else {
      await guild.update({
        verification: {
          messageId: "",
          roleId: "",
          channelId: "",
          status: false
        }
      });
      await ctx.editOrReply({ content: "The verification system has been disabled." });
    }
  }
}