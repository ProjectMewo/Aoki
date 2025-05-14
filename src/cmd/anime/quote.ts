import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Quote extends Subcommand {
  constructor() {
    super({
      name: 'quote',
      description: 'Get a random anime quote',
      options: [],
      permissions: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    try {
      const response = await fetch(`https://waifu.it/api/v4/quote`, {
        headers: { 'Authorization': process.env.WAIFU_IT || "" }
      });
      
      if (!response.ok) {
        return AokiError.API_ERROR({
          sender: i,
          content: "There was an error getting a quote. Try again later, or my sensei probably messed up."
        });
      }
      
      const data = await response.json();
      
      await i.editReply({ 
        content: `**${data.author}** from **${data.anime}**:\n\n*${data.quote}*` 
      });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "There was an error getting a quote. Try again later, or my sensei probably messed up."
      });
    }
  };
}