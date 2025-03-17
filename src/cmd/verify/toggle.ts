import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Toggle extends Subcommand {
  constructor() {
    super({
      name: 'toggle',
      description: 'toggle the verification system for this server',
      permissions: ['ManageGuild'],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const { guild } = i;
    const data = i.client.guilds.cache.get(guild!.id);
    const currentStatus = data?.settings.verification.status || false;

    // If the current status is disabled, enable it
    if (currentStatus == false) {
      await data!.update({ verification: { status: true } });
      await i.reply({ content: "The verification system has been enabled." });
      return;
    }
    // If the current status is enabled, disable it
    // Then, clear existing settings
    else {
      await data!.update({
        verification: {
          messageId: "",
          roleId: "",
          channelId: "",
          status: false
        }
      });
      await i.reply({ content: "The verification system has been disabled." });
    };
  }
}