import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Interaction, MessageFlags } from 'discord.js';
import Event from '../struct/handlers/Event';
import AokiClient from '../struct/Client';

class InteractionCreateEvent extends Event {
  public constructor() {
    super('interactionCreate');
  }

  /**
   * Execute the event
   * @param {AokiClient} client Client object
   * @param {Interaction} i The interaction object
   */
  public async execute(client: AokiClient, i: Interaction): Promise<void> {
    // if we have an autocomplete interaction
    if (i.isAutocomplete()) {
      const interaction = i as AutocompleteInteraction;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
    // if this is a verification request (by button click) 
    else if (i.isButton()) {
      const interaction = i as ButtonInteraction;
      if (interaction.customId.startsWith("verify_")) {
        await interaction.reply({
          content: `Start your verification by clicking [here](${client.dev ? "http://localhost:8080/" : "https://aoki.hackers.moe"}/login?id=${interaction.user.id}&guildId=${interaction.guild!.id}).`,
          flags: MessageFlags.Ephemeral
        });
        return;
      } else { return; }
    }
    // if this is a normal command request
    else if (i.isChatInputCommand()) {
      const interaction = i as ChatInputCommandInteraction;
      // temporarily ignore all chat commands invoked in a DM
      if (!interaction || !interaction.guild) { 
        interaction.reply({ content: 'I can\'t do that in your DMs, baka. But maybe one day. Sensei told me he will do it.', ephemeral: true });
        return;
      };
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        await interaction.reply({ content: 'That command is probably gone. It\'ll disappear in a while.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (!command.hasPermissions(interaction)) {
        await interaction.reply({ content: 'Baka, you don\'t have the permissions to use this command.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (command.isOnCooldown(interaction.user.id)) {
        await interaction.reply({
          content: `Baka, I'm not a spamming machine. Try again in ${command.getRemainingCooldown(interaction.user.id)} seconds.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      try {
        await command.execute(interaction);
        if (command.cooldown) command.setCooldown(interaction.user.id);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export default new InteractionCreateEvent();
