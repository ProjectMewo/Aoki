import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createRoleOption,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";
import { TournamentRound } from "@local-types/settings";

const options = {
  name: createStringOption({
    description: 'full name of the tournament',
    description_localizations: {
      "en-US": 'full name of the tournament',
      "vi": 'tên đầy đủ của giải đấu'
    },
    required: true
  }),
  abbreviation: createStringOption({
    description: 'short form (abbreviation) of the tournament',
    description_localizations: {
      "en-US": 'short form (abbreviation) of the tournament',
      "vi": 'viết tắt của giải đấu'
    },
    required: true
  }),
  host_role: createRoleOption({
    description: 'the role for tournament hosts/organizers',
    description_localizations: {
      "en-US": 'the role for tournament hosts/organizers',
      "vi": 'vai trò cho người tổ chức giải đấu'
    },
    required: true
  }),
  advisor_role: createRoleOption({
    description: 'the role for tournament advisors',
    description_localizations: {
      "en-US": 'the role for tournament advisors',
      "vi": 'vai trò cho cố vấn giải đấu'
    },
    required: false
  }),
  mappooler_role: createRoleOption({
    description: 'the role for tournament mappoolers',
    description_localizations: {
      "en-US": 'the role for tournament mappoolers',
      "vi": 'vai trò cho người làm mappool giải đấu'
    },
    required: false
  }),
  tester_role: createRoleOption({
    description: 'the role for tournament testplayers/replayers',
    description_localizations: {
      "en-US": 'the role for tournament testplayers/replayers',
      "vi": 'vai trò cho người test/replay giải đấu'
    },
    required: false
  })
};

@Declare({
  name: 'make',
  description: 'create a new tournament in this server'
})
@Locales({
  name: [
    ['en-US', 'make'],
    ['vi', 'tạo-giải']
  ],
  description: [
    ['en-US', 'create a new tournament in this server'],
    ['vi', 'tạo một giải đấu mới trong máy chủ này']
  ]
})
@Group('tourney')
@Options(options)
export default class Make extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.make;
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
        content: t.alreadyExists(currentSettings.name, currentSettings.abbreviation)
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

    const roles = [
      hostRole, 
      advisorRole, 
      mappoolerRole, 
      testerRole
    ];

    await ctx.editOrReply({
      content: t.success(name, abbreviation, roles)
    });
  }
}
