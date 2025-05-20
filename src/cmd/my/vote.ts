import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
  name: 'vote',
  description: 'get my vote link.'
})
@Locales({
  name: [
    ['en-US', 'vote'],
    ['vi', 'bình-chọn']
  ],
  description: [
    ['en-US', 'get my vote link.'],
    ['vi', 'lấy liên kết bình chọn của tớ.']
  ]
})
export default class Vote extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.vote;
    // construct reply
    const votes = t.replies;
    const voteUrl = `https://top.gg/bot/${ctx.client.me!.id}`;
    const vote = `${ctx.client.utils.array.random(votes)} [${t.doThatHere}.](<${voteUrl}>)\n\n||${t.thanks}||`;
    
    // send reply
    await ctx.write({ content: vote });
  }
}
