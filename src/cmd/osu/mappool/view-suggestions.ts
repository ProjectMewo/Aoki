import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Group,
  SubCommand,
  Embed,
  Locales
} from "seyfert";
import Pagination from "@struct/Paginator";
import { meta } from "@assets/cmdMeta";

@Declare({
  name: 'view-suggestions',
  description: 'view all map suggestions for the current round.'
})
@Locales(meta.osu.mappool.view_suggestions.loc)
@Group('mappool')
export default class ViewSuggestions extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.mappool.viewSuggestions;
    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    const { currentRound, mappools, roles } = settings;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noActiveRound
      });
    }

    // Check user permissions
    const permittedRoles = [
      ...roles.host,
      ...roles.advisor,
      ...roles.mappooler,
      ...roles.testReplayer
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    // Find the mappool for the current round
    const mappool = mappools.find(mp => mp.round === currentRound);
    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noMappool(currentRound)
      });
    }

    // Check if there are any suggestions
    if (!mappool.suggestions || mappool.suggestions.length === 0) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noSuggestions(currentRound)
      });
    }

    // Create paginated embeds for the suggestions
    const pages = new Pagination();
    for (const suggestion of mappool.suggestions) {
      const beatmapPromises = suggestion.urls.map(url =>
        ctx.client.utils.osu.fetchBeatmapInfo(ctx.client, ctx.client.utils.osu.extractDifficultyId(url))
      );

      const beatmaps = await Promise.all(beatmapPromises);

      const mapsText = beatmaps.map((beatmap, index) => {
        if (!beatmap) return t.failedToLoad(suggestion.urls[index]);
        return `- [${beatmap.beatmapset.artist_unicode} - ${beatmap.beatmapset.title} [${beatmap.version}]](${suggestion.urls[index]})`;
      }).join('\n');

      const embed = new Embed()
        .setTitle(t.suggestionTitle(currentRound))
        .setDescription(t.suggestionDescription(suggestion.slot, mapsText))
        .setColor(10800862)
        .setTimestamp();

      pages.add(embed);
    }

    await pages.handle({
      sender: ctx.interaction,
      filter: 'userOnly',
      time: 90000
    });
  }
}
