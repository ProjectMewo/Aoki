import AokiError from "@struct/AokiError";
import {
  ActionRow,
  Button,
  CommandContext,
  Declare,
  Group,
  SubCommand
} from "seyfert";
import { ButtonStyle } from "seyfert/lib/types";

@Declare({
  name: 'delete',
  description: 'delete the current tournament in this server'
})
@Group('tourney')
export default class Delete extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    // Get current tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server to delete.'
      });
    }

    // Check permission - only hosts can delete the tournament
    const permittedRoles = settings.roles.host;
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to delete this tournament. Only hosts can do this.'
      });
    }

    // Create a confirmation button
    const confirmButton = new Button()
      .setCustomId('confirm-delete')
      .setLabel('Yes, I\'m very sure!')
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRow<Button>().addComponents(confirmButton);

    // Send a warning message with the confirmation button
    const message = await ctx.editOrReply({
      content: `Are you sure you want to delete the tournament **${settings.name}** (${settings.abbreviation})? This action cannot be undone!`,
      components: [actionRow]
    }, true);

    // Wait for the user's confirmation
    const confirmation = message.createComponentCollector({
      filter: interaction => interaction.customId === 'confirm-delete' && interaction.user.id === ctx.interaction.user.id,
      timeout: 15000
    });

    confirmation.run("confirm-delete", async (interaction) => {
      // Reset tournament settings
      await guild.update({
        tournament: {
          name: "",
          abbreviation: "",
          currentRound: "",
          mappools: [],
          roles: {
            host: [],
            advisor: [],
            mappooler: [],
            testReplayer: [],
            customMapper: []
          }
        }
      });

      await interaction.editOrReply({
        content: `Successfully deleted the tournament **${settings.name}** (${settings.abbreviation}).`,
        components: []
      });
    });
  }
}
