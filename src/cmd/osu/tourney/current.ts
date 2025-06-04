import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  round: createStringOption({
    description: 'set this as the current active round',
    description_localizations: meta.osu.tourney.current.round,
    required: false,
    autocomplete: async (i) => await Current.prototype.autocomplete(i)
  })
};

@Declare({
  name: 'current',
  description: 'view or set the current tournament round'
})
@Locales(meta.osu.tourney.current.loc)
@Group('tourney')
@Options(options)
export default class Current extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    // fetch the rounds of this tournament
    const guild = await interaction.client.guilds.fetch(interaction.guildId!);
    let rounds = guild.settings.tournament.mappools.map((mappool) => ({
      name: mappool.round,
      value: mappool.round
    }));
    // serve to user
    await this.respondWithLocalizedChoices(
      interaction,
      rounds
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.current;
    const { round } = ctx.options;

    await ctx.deferReply();

    // Get tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    console.log(settings)
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
    settings.currentRound = round;
    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: t.roundSetSuccess(settings.name, round, existingMappool.slots)
    });
  }
}
