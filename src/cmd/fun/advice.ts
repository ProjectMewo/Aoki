import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Advice extends Subcommand {
  constructor() {
    super({
      name: 'advice',
      description: 'get a random piece of advice.',
      permissions: [],
      options: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    try {
      // fetch advice from the API
      const response = await fetch("https://api.adviceslip.com/advice");
      const data = await response.json();
      
      // extract the advice from the response
      const advice = data.slip.advice;
      
      // send the response
      await i.reply({ content: advice });
    } catch {
      return AokiError.API_ERROR({
        sender: i,
        content: "Failed to fetch advice. Try again later."
      });
    }
  };
}