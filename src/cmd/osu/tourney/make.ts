import { meta } from "@assets/cmdMeta";
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

const options = {
  name: createStringOption({
    description: 'full name of the tournament',
    description_localizations: meta.osu.tourney.make.name,
    required: true
  }),
  abbreviation: createStringOption({
    description: 'short form (abbreviation) of the tournament',
    description_localizations: meta.osu.tourney.make.abbreviation,
    required: true
  }),
  host_role: createRoleOption({
    description: 'the role for tournament hosts/organizers',
    description_localizations: meta.osu.tourney.make.host_role,
    required: true
  }),
  advisor_role: createRoleOption({
    description: 'the role for tournament advisors',
    description_localizations: meta.osu.tourney.make.advisor_role,
    required: false
  }),
  mappooler_role: createRoleOption({
    description: 'the role for tournament mappoolers',
    description_localizations: meta.osu.tourney.make.mappooler_role,
    required: false
  }),
  tester_role: createRoleOption({
    description: 'the role for tournament testplayers/replayers',
    description_localizations: meta.osu.tourney.make.tester_role,
    required: false
  })
};

@Declare({
  name: 'make',
  description: 'create a new tournament in this server'
})
@Locales(meta.osu.tourney.make.loc)
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
    const currentSettings = guild.settings?.tournament;
    if (currentSettings && currentSettings.name) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.alreadyExists(currentSettings.name, currentSettings.abbreviation)
      });
    }

    // Setup basic tournament structure
    const tournamentSettings = {
      name,
      abbreviation,
      currentRound: "",
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
