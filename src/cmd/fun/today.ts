import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Today extends Subcommand {
  constructor() {
    super({
      name: 'today',
      description: 'get a historical event that happened on today\'s date.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Get current date
    const [month, day] = new Date().toLocaleDateString().trim().split("/");
    
    // Fetch historical data
    const todayRes = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
    
    if (!todayRes.ok) {
      throw new Error(`Failed to fetch historical data: ${todayRes.status}`);
    }
    
    const todayJs = await todayRes.json() as { data: { Events: Array<{ text: string; year: string }> }, date: string };
    
    // Get random event
    const { text, year } = i.client.utils.array.random(todayJs.data.Events);
    
    // Send response
    await i.reply({ content: `On **${todayJs.date}, ${year}**: ${text}` });
  };
}