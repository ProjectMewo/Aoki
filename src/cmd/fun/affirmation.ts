import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Affirmation extends Subcommand {
  constructor() {
    super({
      name: 'affirmation',
      description: 'get a positive affirmation to brighten your day.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Fetch data from the affirmation API
    const res = await fetch("https://www.affirmations.dev").then(res => res.json());
    // Extract the affirmation from the response
    const affirmation = res.affirmation;
    // Send the response
    await i.reply({ content: affirmation });
  };
}