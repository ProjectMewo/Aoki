import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Vote extends Subcommand {
  constructor() {
    super({
      name: 'vote',
      description: 'get the vote link for the bot',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // construct reply
    const votes: string[] = ["Vote? Sweet.", "You finally decided to show up?", "Oh, hi. I'm busy, so get it done.", "Not like I'm not busy, but sure."];
    const voteUrl: string = `https://top.gg/bot/https://top.gg/bot/${i.client.user!.id}`;
    const vote: string = `${i.client.utils.array.random(votes)} [Do that here.](<${voteUrl}>)\n\n||If you decided to vote, thank you. You'll get extra perks in the future.||`;
    
    // send reply
    await i.reply({ content: vote });
  }
}