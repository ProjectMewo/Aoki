import { 
  Interaction, 
  MessageFlags 
} from 'discord.js';
import Event from '@struct/handlers/Event';
import AokiClient from '@struct/Client';
import AokiError from '@struct/handlers/AokiError';

class InteractionCreateEvent extends Event {
  public constructor() {
    super({
      name: 'interactionCreate',
      once: false
    });
  }

  /**
   * Execute the event
   * @param {AokiClient} client Client object
   * @param {Interaction} i The interaction object
   */
  public async execute(client: AokiClient, i: Interaction): Promise<void> {
    // Handle autocomplete interactions
    if (i.isAutocomplete()) {
      const command = client.commands.get(i.commandName);
      if (!command) return;
      
      try {
        await command.autocomplete(i);
      } catch (error) {
        console.error(error);
      }
      return;
    }
    
    // Handle verification button clicks
    if (i.isButton() && i.customId.startsWith("verify_")) {
      const baseUrl = client.dev ? "http://localhost:8080/" : "https://aoki.hackers.moe";
      await i.reply({
        content: `Start your verification by clicking [here](${baseUrl}/login?id=${i.user.id}&guildId=${i.guild!.id}).`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Handle chat commands
    if (i.isChatInputCommand()) {
      // Reject commands in DMs
      if (!i.guild) {
        return AokiError.GENERIC({
          sender: i,
          content: "I can't do that in your DMs, baka. But maybe one day. Sensei told me he will do it."
        });
      }
      
      const command = client.commands.get(i.commandName);

      if (!command) {
        return AokiError.GENERIC({
          sender: i,
          content: "That command is probably gone. It will disappear in a while."
        });
      };
      
      await command.execute(i);
    }
  }
}

export default new InteractionCreateEvent();
