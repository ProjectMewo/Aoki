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

const options = {
  slot: createStringOption({
    description: 'The slot to suggest this map to',
    required: true
  }),
  url: createStringOption({
    description: 'The beatmap URL (must include difficulty ID)',
    required: true
  }),
  confirm: createBooleanOption({
    description: 'Confirm you know the correct current round is set',
    required: true
  })
};

@Declare({
  name: 'suggest',
  description: 'Suggest a new map for this mappool slot'
})
@Group('mappool')
@Options(options)
export default class Suggest extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { slot, url, confirm } = ctx.options;

    if (!confirm) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Nice, good trolling there, you baka.\n\nOr are you genuine? Tell your organizer, or just ask me what is the current set round with `/tourney current`."
      });
    }

    await ctx.deferReply();

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.mappooler,
      ...settings.roles.testReplayer
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to suggest maps for the mappool. Only organizers, advisors, mappoolers, and test/replayers can suggest maps.'
      });
    }

    const { currentRound, mappools } = settings;

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.'
      });
    }

    const mappool = mappools.find(mp => mp.round === currentRound);

    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No mappool found for the current round: ${currentRound}. Remind your organizer to provide all slots of this mappool!`
      });
    }

    if (!mappool.slots.includes(slot)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `The slot "${slot}" doesn't exist in the ${currentRound} mappool. Available slots: ${mappool.slots.join(', ')}`
      });
    }

    const fullUrlPattern = /^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#(?:osu|taiko|fruits|mania)\/\d+$/i;
    const shortUrlPattern = /^https?:\/\/osu\.ppy\.sh\/b\/\d+$/i;

    if (!fullUrlPattern.test(url) && !shortUrlPattern.test(url)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'Invalid beatmap URL. Please provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).'
      });
    }

    let suggestion = mappool.suggestions.find(s => s.slot === slot);
    if (!suggestion) {
      suggestion = { slot, urls: [] };
      mappool.suggestions.push(suggestion);
    }

    if (!suggestion.urls.includes(url)) {
      suggestion.urls.push(url);

      await guild.update({
        tournament: settings
      });

      await ctx.editOrReply({
        content: `Successfully added your suggestion for slot ${slot} in the ${currentRound} mappool.`
      });
    } else {
      await ctx.editOrReply({
        content: `This map has already been suggested for slot ${slot}.`
      });
    }
  }
}
