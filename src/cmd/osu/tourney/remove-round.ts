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
    description: 'the tournament round to remove',
    description_localizations: meta.osu.tourney.remove_round.round,
    required: true,
    autocomplete: async i => await RemoveRound.prototype.autocomplete(i)
  })
};

@Declare({
  name: 'remove-round',
  description: 'remove a tournament round'
})
@Locales(meta.osu.tourney.remove_round.loc)
@Group('tourney')
@Options(options)
export default class RemoveRound extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    // fetch the rounds of this tournament
    const guild = await interaction.client.guilds.fetch(interaction.guildId!);
    const rounds = guild.settings.tournament.mappools.map((mappool) => ({
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
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.removeRound;
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

    // Check permission - only hosts, advisors, and mappoolers can remove rounds
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
        content: t.noPermission
      });
    }

    // Check if round exists
    const existingMappoolIndex = settings.mappools.findIndex(mp => mp.round === round);
    if (existingMappoolIndex === -1) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.roundNotFound(round)
      });
    }

    // Remove the round
    settings.mappools.splice(existingMappoolIndex, 1)[0];

    // Update current round if it was the one being removed
    if (settings.currentRound === round) {
      settings.currentRound = "";
    }

    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: t.success
    });
  }
}