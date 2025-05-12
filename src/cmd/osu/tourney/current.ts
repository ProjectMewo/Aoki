import { TournamentRound } from "@local-types/settings";
import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";

const options = {
  round: createStringOption({
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
  })
};

@Declare({
  name: 'current',
  description: 'view or set the current tournament round'
})
@Group('tourney')
@Options(options)
export default class Current extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { round } = ctx.options;

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

    // If no round provided, display current round info
    if (!round) {
      if (!settings.currentRound) {
        await ctx.editOrReply({
          content: `**${settings.name}** (${settings.abbreviation}) doesn't have a current active round set.\n\nUse \`/tourney current [round]\` to set one.`
        });
        return;
      }

      const currentMappool = settings.mappools.find(mp => mp.round === settings.currentRound);
      const slotInfo = currentMappool && currentMappool.slots.length > 0
        ? `Available slots: ${currentMappool.slots.join(', ')}`
        : 'No slots defined for this round.';

      await ctx.editOrReply({
        content: `**${settings.name}** (${settings.abbreviation}) is currently in the **${settings.currentRound}** stage.\n\n${slotInfo}`
      });
      return;
    }

    // Setting a new current round - check permissions
    const permittedRoles = [...settings.roles.host, ...settings.roles.advisor];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to change the current round. Only hosts and advisors can do this.'
      });
    }

    // Check if the round exists in mappools
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (!existingMappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `The round "${round}" doesn't exist in this tournament. Add it first with \`/tourney add-round\`.`
      });
    }

    // Update the current round
    settings.currentRound = round as TournamentRound;
    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: `Successfully set the current round of **${settings.name}** to **${round}**.\n\nAvailable slots: ${existingMappool.slots.join(', ')}`
    });
  }
}
