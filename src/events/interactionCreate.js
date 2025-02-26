import Event from '../struct/handlers/Event.js';

class InteractionCreateEvent extends Event {
  constructor() {
    super('interactionCreate');
  }
  /**
   * Execute the event
   * @param {Object} client Client object
   */
  async execute(client, i) {
    // if we have an autocomplete interaction
    if (i.isAutocomplete()) {
      const command = i.client.commands.get(i.commandName);
      if (!command) return;
      try {
        await command.autocomplete(i);
      } catch (error) {
        console.error(error);
      }
    } 
    // if this is a verification request (by button click)
    else if (i.isButton()) {
      if (i.customId.startsWith("verify_")) {
        return await i.reply({ 
          content: `Start your verification by clicking [here](${client.dev ? "http://localhost:8080/" : "https://aoki.hackers.moe"}/login?id=${i.user.id}&guildId=${i.guild.id}).`, 
          flags: 64 
        });
      } else { return };
    } 
    // if this is a normal command request
    else if (i.isChatInputCommand()) {
      const command = i.client.commands.get(i.commandName);
      if (!command) 
        return await i.reply({ content: 'That command is probably gone. It\'ll disappear in a while.', flags: 64 });
      if (!command.hasPermissions(i))
        return await i.reply({ content: 'Baka, you don\'t have the permissions to use this command.', flags: 64 });
      if (command.isOnCooldown(i.user.id)) 
        return await i.reply({ 
          content: `Baka, I'm not a spamming machine. Try again in ${command.getRemainingCooldown(i.user.id)} seconds.`, 
          flags: 64 
        });
      try {
        await command.execute(i);
        if (command.cooldown) command.setCooldown(i.user.id);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export default new InteractionCreateEvent();
