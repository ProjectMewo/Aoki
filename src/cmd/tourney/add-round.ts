import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager } from "discord.js";
import { TournamentRound } from '@local-types/settings';

export default class AddRound extends Subcommand {
  constructor() {
    super({
      name: 'add-round',
      description: 'add a tournament round with mappool slots',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'round',
          description: 'the tournament round to add',
          required: true,
          choices: [
            { name: 'Qualifiers', value: 'Qualifiers' },
            { name: 'Group Stage', value: 'Group Stage' },
            { name: 'Round of 32', value: 'Round of 32' },
            { name: 'Round of 16', value: 'Round of 16' },
            { name: 'Quarterfinals', value: 'Quarterfinals' },
            { name: 'Semifinals', value: 'Semifinals' },
            { name: 'Finals', value: 'Finals' },
            { name: 'Grand Finals', value: 'Grand Finals' }
          ]
        },
        {
          type: 'string',
          name: 'slots',
          description: 'mappool slots separated by comma (e.g. NM1,NM2,HD1,HD2,HR1,DT1,FM1,TB1)',
          required: true
        },
        {
          type: 'boolean',
          name: 'set_current',
          description: 'set this as the current active round',
          required: false
        }
      ]
    })
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    // Get tournament settings
    const settings = i.guild!.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    // Check permission - only hosts, advisors, and mappoolers can add rounds
    const permittedRoles = [
      ...settings.roles.host, 
      ...settings.roles.advisor, 
      ...settings.roles.mappooler
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
        content: 'You do not have permission to add tournament rounds. Only hosts, advisors, and mappoolers can do this.'
      });
    }

    // Get input values
    const round = i.options.getString('round', true);
    const slotsInput = i.options.getString('slots', true);
    const setCurrent = i.options.getBoolean('set_current') || false;
    
    // Parse slots
    const slots = slotsInput.split(',').map(slot => slot.trim()).filter(slot => slot);
    
    if (slots.length === 0) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'You must provide at least one mappool slot.'
      });
    }

    // Check if round already exists
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (existingMappool) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `A mappool for ${round} already exists. Use \`/mappool add\` to add maps to it.`
      });
    }

    // Create new mappool
    const newMappool = {
      round: round as TournamentRound,
      slots,
      maps: [],
      replays: [],
      suggestions: []
    };
    
    // Update settings
    settings.mappools.push(newMappool);
    if (setCurrent) {
      settings.currentRound = round as TournamentRound;
    }
    
    await i.guild!.update({
      tournament: settings
    });

    await i.editReply({ 
      content: `Successfully added ${round} with ${slots.length} slots: ${slots.join(', ')}.\n` +
      (setCurrent ? `This is now set as the current active round.` : `Use \`/tourney current ${round}\` to set this as the current round.`)
    });
  }
}
