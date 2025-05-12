import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createBooleanOption,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";
import { TournamentRound } from "@local-types/settings";

const options = {
  round: createStringOption({
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
  }),
  slots: createStringOption({
    description: 'mappool slots separated by comma (e.g. NM1,NM2,HD1,HD2,HR1,DT1,FM1,TB1)',
    required: true
  }),
  set_current: createBooleanOption({
    description: 'set this as the current active round',
    required: false
  })
};

@Declare({
  name: 'add-round',
  description: 'add a tournament round with mappool slots'
})
@Group('tourney')
@Options(options)
export default class AddRound extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { round, slots: slotsInput, set_current: setCurrent = false } = ctx.options;

    await ctx.deferReply();

    // Get tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    // Check permission - only hosts, advisors, and mappoolers can add rounds
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.mappooler
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to add tournament rounds. Only hosts, advisors, and mappoolers can do this.'
      });
    }

    // Parse slots
    const slots = slotsInput.split(',').map(slot => slot.trim()).filter(slot => slot);

    if (slots.length === 0) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'You must provide at least one mappool slot.'
      });
    }

    // Check if round already exists
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (existingMappool) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `A mappool for ${round} already exists. Use \`/mappool add\` to add maps to it.`
      });
    }

    // Create new mappool
    const newMappool = {
      round: "" as TournamentRound,
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

    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: `Successfully added ${round} with ${slots.length} slots: ${slots.join(', ')}.\n` +
        (setCurrent ? `This is now set as the current active round.` : `Use \`/tourney current ${round}\` to set this as the current round.`)
    });
  }
}
