import { ChatInputCommandInteraction, createEvent } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';
 
export default createEvent({
  data: { once: false, name: 'interactionCreate' },
  async run(interaction, client) {
    if (!interaction) return;
    if (!interaction?.guild) {
      await (interaction as ChatInputCommandInteraction).editOrReply({
        content:
          "I can't do that in your DMs, baka. But maybe one day. Sensei told me he will do it."
      });
      return;
    };
    if (interaction?.isButton() && interaction?.customId.startsWith("verify_")) {
      const baseUrl = client.dev ? "http://localhost:8080/" : "https://aoki.hackers.moe";
      await interaction.editOrReply({
        content: `Start your verification by clicking [here](${baseUrl}/login?id=${interaction.user.id}&guildId=${interaction.guild!.id}).`,
        flags: MessageFlags.Ephemeral
      });
      return;
    };
  }
})
