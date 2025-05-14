import { TournamentRound } from "@local-types/settings";
import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Make extends Subcommand {
  constructor() {
    super({
      name: 'make',
      description: 'create a new tournament in this server',
      permissions: ['ManageGuild'],
      options: [
        {
          type: 'string',
          name: 'name',
          description: 'full name of the tournament',
          required: true
        },
        {
          type: 'string',
          name: 'abbreviation',
          description: 'short form (abbreviation) of the tournament',
          required: true
        },
        {
          type: 'role',
          name: 'host_role',
          description: 'the role for tournament hosts/organizers',
          required: true
        },
        {
          type: 'role',
          name: 'advisor_role',
          description: 'the role for tournament advisors',
          required: false
        },
        {
          type: 'role',
          name: 'mappooler_role',
          description: 'the role for tournament mappoolers',
          required: false
        },
        {
          type: 'role',
          name: 'tester_role',
          description: 'the role for tournament testplayers/replayers',
          required: false
        }
      ]
    })
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    // Get input values
    const name = i.options.getString('name', true);
    const abbreviation = i.options.getString('abbreviation', true);
    const hostRole = i.options.getRole('host_role', true);
    const advisorRole = i.options.getRole('advisor_role');
    const mappoolerRole = i.options.getRole('mappooler_role');
    const testerRole = i.options.getRole('tester_role');

    // Check if tournament already exists
    const currentSettings = i.guild!.settings.tournament;
    if (currentSettings.name) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `A tournament already exists in this server: **${currentSettings.name}** (${currentSettings.abbreviation}). You need to reset it before creating a new one.`
      });
    }

    // Setup basic tournament structure
    const tournamentSettings = {
      name,
      abbreviation,
      currentRound: "" as TournamentRound,
      mappools: [],
      roles: {
        host: [hostRole.id],
        advisor: advisorRole ? [advisorRole.id] : [],
        mappooler: mappoolerRole ? [mappoolerRole.id] : [],
        testReplayer: testerRole ? [testerRole.id] : [],
        customMapper: [],
        streamer: []
      }
    };

    // Update guild settings
    await i.guild!.update({
      tournament: tournamentSettings
    });

    await i.editReply({ 
      content: `Successfully created tournament **${name}** (${abbreviation})!\n\n` +
      `Assigned roles:\n` +
      `- Host: <@&${hostRole.id}>\n` +
      `${advisorRole ? `- Advisor: <@&${advisorRole.id}>\n` : ''}` +
      `${mappoolerRole ? `- Mappooler: <@&${mappoolerRole.id}>\n` : ''}` +
      `${testerRole ? `- Tester/Replayer: <@&${testerRole.id}>\n` : ''}` +
      `\nUse \`/tourney add-round\` to set up rounds and mappools.`
    });
  }
}
