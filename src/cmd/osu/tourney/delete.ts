import AokiError from "@struct/AokiError";
import {
  ActionRow,
  Button,
  CommandContext,
  Declare,
  Group,
  LocalesT,
  SubCommand
} from "seyfert";
import { ButtonStyle } from "seyfert/lib/types";

@Declare({
  name: 'delete',
  description: 'delete the current tournament in this server'
})
@LocalesT('osu.tourney.delete.name', 'osu.tourney.delete.description')
@Group('tourney')
export default class Delete extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.delete;
    await ctx.deferReply();

    // Get current tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    // Check permission - only hosts can delete the tournament
    const permittedRoles = settings.roles.host;
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    // Create a confirmation button
    const confirmButton = new Button()
      .setCustomId('confirm-delete')
      .setLabel(t.verySure)
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRow<Button>().addComponents(confirmButton);

    // Send a warning message with the confirmation button
    const message = await ctx.editOrReply({
      content: t.confirmPrompt(settings.name, settings.abbreviation),
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
        content: t.success(settings.name, settings.abbreviation),
        components: []
      });
    });
  }
}
