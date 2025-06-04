import { ButtonInteraction, ChatInputCommandInteraction, createEvent } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';

export default createEvent({
  data: { once: false, name: 'interactionCreate' },
  async run(interaction, client) {
    if (!interaction) return;

    // handle ChatInputCommandInteraction
    if (interaction instanceof ChatInputCommandInteraction) {
      if (!interaction.guild) {
        await interaction.editOrReply({
          content: interaction.t.interactionCreate.noDm,
        });
        return;
      }
    }

    // handle ButtonInteraction with "verify_" prefix
    if (interaction.isButton() && interaction.customId.startsWith("verify_")) {
      const buttonInteraction = interaction as ButtonInteraction;
      const baseUrl = client.dev ? "http://localhost:8080/" : "https://aoki.mewo.workers.dev";

      await buttonInteraction.editOrReply({
        content: buttonInteraction.t.interactionCreate.startVerif(
          baseUrl,
          buttonInteraction.user.id,
          buttonInteraction.guild?.id!
        ),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  },
});
