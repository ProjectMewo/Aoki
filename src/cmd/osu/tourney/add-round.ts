import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createBooleanOption,
  createStringOption,
  Declare,
  Group,
  LocalesT,
  Options,
  SubCommand,
  AutocompleteInteraction
} from "seyfert";
import { TournamentRound } from "@local-types/settings";

const options = {
  round: createStringOption({
    description: 'the tournament round to add',
    description_localizations: {
      "en-US": 'the tournament round to add',
      "vi": 'vòng đấu giải đấu cậu muốn thêm'
    },
    required: true,
    autocomplete: async (interaction) => await AddRound.prototype.autocomplete(interaction)
  }),
  slots: createStringOption({
    description: 'mappool slots separated by comma (e.g. NM1,NM2)',
    description_localizations: {
      "en-US": 'mappool slots separated by comma (e.g. NM1,NM2)',
      "vi": 'các slot mappool được phân tách bằng dấu phẩy (ví dụ: NM1,NM2)'
    },
    required: true
  }),
  set_current: createBooleanOption({
    description: 'set this as the current active round',
    description_localizations: {
      "en-US": 'set this as the current active round',
      "vi": 'đặt đây là vòng đấu hiện tại'
    },
    required: false
  })
};

@Declare({
  name: 'add-round',
  description: 'add a tournament round with mappool slots'
})
@LocalesT('osu.tourney.addRound.name', 'osu.tourney.addRound.description')
@Group('tourney')
@Options(options)
export default class AddRound extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.genericRoundChoices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.addRound;
    const { round, slots: slotsInput, set_current: setCurrent = false } = ctx.options;

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
        content: t.noPermission
      });
    }

    // Parse slots
    const slots = slotsInput.split(',').map(slot => slot.trim()).filter(slot => slot);

    if (slots.length === 0) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noSlots
      });
    }

    // Check if round already exists
    const existingMappool = settings.mappools.find(mp => mp.round === round);
    if (existingMappool) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.roundExists(round)
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
      content: t.success(round, slots, setCurrent)
    });
  }
}
