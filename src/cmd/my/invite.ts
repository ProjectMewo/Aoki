import { meta } from "@assets/cmdMeta";
import { CommandContext, Declare, Embed, Locales, SubCommand } from "seyfert";

@Declare({
  name: "invite",
  description: "take me to your server."
})
@Locales(meta.my.invite.loc)
export default class Invite extends SubCommand {
  async run(ctx: CommandContext) {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.invite;
    const description = t.desc;
    
    const embed = new Embed()
      .setColor(10800862)
      .setDescription(description)
      .setTitle(t.title)
      .setThumbnail(ctx.client.me!.avatarURL())
      .setFooter({ text: t.madeWLove })
      .setTimestamp();
      
    await ctx.editOrReply({ embeds: [embed] });
  }
}
