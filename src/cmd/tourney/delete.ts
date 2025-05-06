import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  GuildMemberRoleManager
} from "discord.js";

export default class Delete extends Subcommand {
  constructor() {
    super({
      name: 'delete',
      description: 'delete the current tournament in this server',
      permissions: ['Administrator'],
      options: []
    });
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    // Get current tournament settings
    const settings = i.guild!.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: 'No tournament exists in this server to delete.'
      });
    }

    // Check permission - only hosts can delete the tournament
    const permittedRoles = [
      ...settings.roles.host
    ];

    let userRoles;
    if (i.member!.roles instanceof GuildMemberRoleManager) {
      userRoles = i.member!.roles.cache.map(role => role.id);
    } else {
      userRoles = i.member!.roles;
    }

    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));
    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: i,
        content: 'You do not have permission to add maps to the mappool. Only hosts can do this.'
      });
    }

    // Create a confirmation button
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm-delete')
      .setLabel('Confirm Deletion')
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

    // Send a warning message with the confirmation button
    await i.editReply({
      content: `Are you sure you want to delete the tournament **${settings.name}** (${settings.abbreviation})? This action cannot be undone!`,
      components: [actionRow]
    });

    // Wait for the user's confirmation
    const filter = (interaction: any) => interaction.customId === 'confirm-delete' && interaction.user.id === i.user.id;
    const confirmation = await i.channel!.awaitMessageComponent({ filter, time: 15000 }).catch(() => null);

    if (!confirmation) {
      await i.editReply({
        content: 'Tournament deletion cancelled.',
        components: []
      });
      return;
    }

    // Reset tournament settings
    await i.guild!.update({
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
          customMapper: [],
          streamer: []
        }
      }
    });

    await i.editReply({
      content: `Successfully deleted the tournament **${settings.name}** (${settings.abbreviation}).`,
      components: []
    });
  }
}