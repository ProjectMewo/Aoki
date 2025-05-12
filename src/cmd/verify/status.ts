import {
  CommandContext,
  Declare,
  SubCommand
} from "seyfert";

@Declare({
  name: "status",
  description: "check the verification status for this server"
})
export default class Status extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const enabled = guild.settings.verification.status;

    await ctx.write({
      content: `The verification system is currently ${enabled ? "enabled" : "disabled"}.`
    });
  }
}