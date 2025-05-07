import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager } from "discord.js";

export default class AddRole extends Subcommand {
  constructor() {
    super({
      name: 'add-role',
      description: 'add additional roles to a tournament roleset',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'roleset',
          description: 'the roleset to add the role to (e.g., host, advisor, mappooler)',
          required: true,
          choices: [
            { name: 'Host', value: 'host' },
            { name: 'Advisor', value: 'advisor' },
            { name: 'Mappooler', value: 'mappooler' },
            { name: 'Tester/Replayer', value: 'testReplayer' },
            { name: 'Custom Mapper', value: 'customMapper' },
            { name: 'Streamer', value: 'streamer' }
          ]
        },
        {
          type: 'role',
          name: 'role',
          description: 'the role to add to the selected roleset',
          required: true
        }
      ]
    });
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    // Get input values
    const roleset = i.options.getString('roleset', true) as keyof typeof currentSettings.roles;
    const role = i.options.getRole('role', true);

    // Check if a tournament exists
    const currentSettings = i.guild!.settings.tournament;
    if (!currentSettings.name) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `No tournament exists in this server. Use \`/tourney make\` to create one first.`
      });
    }

    // Check permission - only hosts can add roles to this tournament
    const permittedRoles = currentSettings.roles.host;

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
        content: 'You do not have permission to add roles to rolesets. Only hosts can do this.'
      });
    }

    // Validate roleset
    if (!(roleset in currentSettings.roles)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `Invalid roleset: **${roleset}**. Please choose a valid roleset.`
      });
    }

    // Check if the role is already added
    if (currentSettings.roles[roleset].includes(role.id)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `The role <@&${role.id}> is already part of the **${roleset}** roleset.`
      });
    }

    // Add the role to the roleset
    currentSettings.roles[roleset].push(role.id);

    // Update guild settings
    await i.guild!.update({
      tournament: currentSettings
    });

    await i.editReply({
      content: `Successfully added role <@&${role.id}> to the **${roleset}** roleset!`
    });
  }
}