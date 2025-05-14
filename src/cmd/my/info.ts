import { CommandContext, Declare, Embed, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: "info",
  description: "get information about me"
})
@LocalesT('my.info.name', 'my.info.description')
export default class Info extends SubCommand {
  async run(ctx: CommandContext) {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.info;
    // construct message parts
    const description = t.desc;
    
    const fields = [t.fieldOne, t.fieldTwo, t.fieldThree];
    
    // construct embed
    const embed = new Embed()
      .setColor(10800862)
      .setDescription(description)
      .addFields(fields)
      .setTitle("/my info")
      .setThumbnail("https://i.imgur.com/Nar1fRE.png")
      .setFooter({ text: t.madeWLove })
      .setTimestamp();
      
    // send
    await ctx.editOrReply({ embeds: [embed] });
  }
}