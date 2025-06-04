import { meta } from "@assets/cmdMeta";
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
@Locales(meta.verify.status.loc)
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