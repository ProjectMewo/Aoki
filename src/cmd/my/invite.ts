import { CommandContext, Declare, Embed, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: "invite",
  description: "take me to your server."
})
@LocalesT('my.invite.name', 'my.invite.description')
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
