import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createRoleOption,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";
import { TournamentRound } from "@local-types/settings";

const options = {
  name: createStringOption({
    description: 'full name of the tournament',
    required: true
  }),
  abbreviation: createStringOption({
    description: 'short form (abbreviation) of the tournament',
    required: true
  }),
  host_role: createRoleOption({
    description: 'the role for tournament hosts/organizers',
    required: true
  }),
  advisor_role: createRoleOption({
    description: 'the role for tournament advisors',
    required: false
  }),
  mappooler_role: createRoleOption({
    description: 'the role for tournament mappoolers',
    required: false
  }),
  tester_role: createRoleOption({
    description: 'the role for tournament testplayers/replayers',
    required: false
  })
};

@Declare({
  name: 'make',
  description: 'create a new tournament in this server'
})
@Group('tourney')
@Options(options)
export default class Make extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { 
      name, 
      abbreviation, 
      host_role: hostRole, 
      advisor_role: advisorRole, 
      mappooler_role: mappoolerRole, 
      tester_role: testerRole 
    } = ctx.options;

    await ctx.deferReply();

    // Check if a tournament already exists
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const currentSettings = guild.settings.tournament;
    if (currentSettings.name) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
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
    await guild.update({
      tournament: tournamentSettings
    });

    await ctx.editOrReply({
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
