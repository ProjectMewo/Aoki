import { CommandContext, Declare, Embed, SubCommand } from "seyfert";

@Declare({
  name: "invite",
  description: "take me to your server."
})
export default class Invite extends SubCommand {
  async run(ctx: CommandContext) {
    const description: string = [
      "Hey, you want to take me to your server? Great. Let's make your server a little more lively.\n",
      `[Click here to take me there.](https://discord.com/oauth2/authorize?client_id=${ctx.client.me!.id})`,
      "I'm quite exited to see what you have."
    ].join("\n");
    
    const embed = new Embed()
      .setColor(10800862)
      .setDescription(description)
      .setTitle("Invite me?")
      .setThumbnail(ctx.client.me!.avatarURL())
      .setFooter({ text: `Made with ❤` })
      .setTimestamp();
      
    await ctx.editOrReply({ embeds: [embed] });
  }
}
