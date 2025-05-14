import { TournamentRound } from "@local-types/settings";
import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager, MessageFlags } from "discord.js";

export default class Current extends Subcommand {
  constructor() {
    super({
      name: 'current',
      description: 'view or set the current tournament round',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'round',
          description: 'set this as the current active round',
          required: false,
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
        }
      ]
    })
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Get tournament settings
    const settings = i.guild!.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    const round = i.options.getString('round');
    
    // If no round provided, just display current round info
    if (!round) {
      if (!settings.currentRound) {
        await i.reply({ 
          content: `**${settings.name}** (${settings.abbreviation}) doesn't have a current active round set.\n\nUse \`/tourney current [round]\` to set one.`,
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      
      // Find the mappool for the current round
      const currentMappool = settings.mappools.find(mp => mp.round === settings.currentRound);
      let slotInfo = 'No slots defined for this round.';
      
      if (currentMappool && currentMappool.slots.length > 0) {
        slotInfo = `Available slots: ${currentMappool.slots.join(', ')}`;
      }
      
      await i.reply({
        content: `**${settings.name}** (${settings.abbreviation}) is currently in the **${settings.currentRound}** stage.\n\n${slotInfo}`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    // Setting a new current round - check permissions
    const permittedRoles = [
      ...settings.roles.host, 
      ...settings.roles.advisor
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
        content: 'You do not have permission to change the current round. Only hosts and advisors can do this.'
      });
    }
    
    // Check if the round exists in mappools
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (!existingMappool) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `The round "${round}" doesn't exist in this tournament. Add it first with \`/tourney add-round\`.`
      });
    }
    
    // Update the current round
    settings.currentRound = round as TournamentRound;
    await i.guild!.update({
      tournament: settings
    });
    
    await i.reply({
      content: `Successfully set the current round of **${settings.name}** to **${round}**.\n\nAvailable slots: ${existingMappool.slots.join(', ')}`,
      ephemeral: false
    });
  }
}
