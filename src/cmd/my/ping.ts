import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Ping extends Subcommand {
  constructor() {
    super({
      name: 'ping',
      description: 'check the latency of the bot',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: "Pinging..." });

    const replies = await i.client.utils.profane.getStatic("ping");

    const reply = i.client.utils.array.random(replies)
      .replace(/{{user}}/g, i.user.username)
      .replace(/{{ms}}/g, Math.round(i.client.ws.ping).toString());

    await i.editReply({ content: reply });
  }
}