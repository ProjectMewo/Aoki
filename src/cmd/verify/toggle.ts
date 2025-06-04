import { meta } from "@assets/cmdMeta";
import {
  CommandContext,
  Declare,
  Locales,
  SubCommand
} from "seyfert";

@Declare({
  name: "toggle",
  description: "toggle the verification system for this server"
})
@Locales(meta.verify.toggle.loc)
export default class Toggle extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).verify.toggle;
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const currentStatus = guild.settings.verification.status || false;

    await ctx.deferReply();

    if (!currentStatus) {
      await guild.update({ verification: { status: true } });
      await ctx.editOrReply({ content: t.enabled });
    } else {
      await guild.update({
        verification: {
          messageId: "",
          roleId: "",
          channelId: "",
          status: false
        }
      });
      await ctx.editOrReply({ content: t.disabled });
    }
  }
}