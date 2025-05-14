import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Status extends Subcommand {
  constructor() {
    super({
      name: 'status',
      description: 'check the verification status for this server',
      permissions: ['ManageGuild'],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const { guild } = i;
    const data = i.client.guilds.cache.get(guild!.id);
    const enabled = data?.settings.verification.status;
    
    await i.reply({ content: `The verification system is currently ${enabled ? "enabled" : "disabled"}.` });
  }
}