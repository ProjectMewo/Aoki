import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
  name: 'vote',
  description: 'get my vote link.'
})
@LocalesT('my.vote.name', 'my.vote.description')
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
