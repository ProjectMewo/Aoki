import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Fact extends Subcommand {
  constructor() {
    super({
      name: 'fact',
      description: 'Get a random fact.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Define the URLs for facts
    const urls = ["https://catfact.ninja/fact", "https://uselessfacts.jsph.pl/random.json?language=en"];
    
    // Get a random URL from the array
    const randomUrl = i.client.utils.array.random(urls);
    
    // Fetch the data from the API
    const res = await fetch(randomUrl).then(res => res.json());
    
    // Extract the content (could be in .text or .fact property)
    const content = res.text || res.fact;
    
    // Send the response
    await i.reply({ content });
  };
}