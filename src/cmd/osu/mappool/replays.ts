import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand,
  AutocompleteInteraction
} from "seyfert";

const options = {
  round: createStringOption({
    description: 'the round to view replays for',
    description_localizations: {
      "en-US": 'the round to view replays for',
      "vi": 'vòng đấu mà cậu muốn xem replay'
    },
    required: false,
    autocomplete: async (interaction) => await Replays.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: 'replays',
  description: 'view saved replays for a specific round or the current mappool'
})
@Locales({
  name: [
    ['en-US', 'replays'],
    ['vi', 'xem-replay']
  ],
  description: [
    ['en-US', 'view saved replays for a specific round or the current mappool'],
    ['vi', 'xem lại các replay đã lưu']
  ]
})
@Group('mappool')
@Options(options)
export default class Replays extends SubCommand {
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
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.mappool.replays;
    const { round } = ctx.options;

    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    // Check permissions
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.testReplayer
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    const selectedRound = round || settings.currentRound;

    if (!selectedRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noActiveRound
      });
    }

    const mappool = settings.mappools.find(mp => mp.round === selectedRound);

    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noMappool(selectedRound)
      });
    }

    if (!mappool.replays.length) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noReplays(selectedRound)
      });
    }

    const replyContent = t.response(selectedRound, mappool.replays);

    await ctx.editOrReply({ content: replyContent });
  }
}