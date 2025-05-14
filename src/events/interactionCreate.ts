import { ChatInputCommandInteraction, createEvent } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';
 
export default createEvent({
  data: { once: false, name: 'interactionCreate' },
  async run(interaction, client) {
    if (!interaction) return;
    const i = interaction as ChatInputCommandInteraction;
    if (!i?.guild) {
      await i.editOrReply({
        content: i.t.interactionCreate.noDm
      });
      return;
    };
    if (interaction?.isButton() && interaction?.customId.startsWith("verify_")) {
      const baseUrl = client.dev ? "http://localhost:8080/" : "https://aoki.hackers.moe";
      await interaction.editOrReply({
        content: i.t.interactionCreate.startVerif(baseUrl, interaction.user.id, interaction.guild?.id!),
        flags: MessageFlags.Ephemeral
      });
      return;
    };
  }
})
