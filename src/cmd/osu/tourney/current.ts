import { TournamentRound } from "@local-types/settings";
import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Group,
  LocalesT,
  Options,
  SubCommand,
  AutocompleteInteraction
} from "seyfert";

const options = {
  round: createStringOption({
    description: 'set this as the current active round',
    description_localizations: {
      "en-US": 'set this as the current active round',
      "vi": 'đặt vòng này làm vòng hiện tại'
    },
    required: false,
    autocomplete: async (interaction) => await Current.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: 'current',
  description: 'view or set the current tournament round'
})
@LocalesT('osu.tourney.current.name', 'osu.tourney.current.description')
@Group('tourney')
@Options(options)
export default class Current extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.genericRoundChoices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.current;
    const { round } = ctx.options;

    await ctx.deferReply();

    // Get tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    // If no round provided, display current round info
    if (!round) {
      if (!settings.currentRound) {
        await ctx.editOrReply({
          content: t.noActiveRound(settings.name, settings.abbreviation)
        });
        return;
      }

      const currentMappool = settings.mappools.find(mp => mp.round === settings.currentRound);
      const slotInfo = t.slotInfo(currentMappool)

      await ctx.editOrReply({
        content: t.currentRoundInfo(settings.name, settings.abbreviation, settings.currentRound, slotInfo)
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
        content: t.noPermission
      });
    }

    // Check if the round exists in mappools
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (!existingMappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.roundNotFound(round)
      });
    }

    // Update the current round
    settings.currentRound = round as TournamentRound;
    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: t.roundSetSuccess(settings.name, round, existingMappool.slots)
    });
  }
}
