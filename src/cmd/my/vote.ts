import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
  name: 'vote',
  description: 'get the vote link for the bot'
})
export default class Vote extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    // construct reply
    const votes: string[] = ["Vote? Sweet.", "You finally decided to show up?", "Oh, hi. I'm busy, so get it done.", "Not like I'm not busy, but sure."];
    const voteUrl: string = `https://top.gg/bot/${ctx.client.me!.id}`;
    const vote: string = `${ctx.client.utils.array.random(votes)} [Do that here.](<${voteUrl}>)\n\n||If you decided to vote, thank you. You'll get extra perks in the future.||`;
    
    // send reply
    await ctx.write({ content: vote });
  }
}
