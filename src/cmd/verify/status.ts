import {
  CommandContext,
  Declare,
  Locales,
  SubCommand
} from "seyfert";

@Declare({
  name: "status",
  description: "check the verification status for this server"
})
@Locales({
  name: [
    ['en-US', 'status'],
    ['vi', 'trạng-thái']
  ],
  description: [
    ['en-US', 'check the verification status for this server'],
    ['vi', 'kiểm tra trạng thái xác minh cho máy chủ này']
  ]
})
export default class Status extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).verify.status;
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const enabled = guild.settings.verification.status || false;

    await ctx.write({
      content: t.current(enabled)
    });
  }
}