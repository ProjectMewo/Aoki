import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Group,
  SubCommand,
  Embed
} from "seyfert";
import Pagination from "@struct/Paginator";

@Declare({
  name: 'view-suggestions',
  description: 'view all map suggestions for the current round.'
})
@Group('mappool')
export default class ViewSuggestions extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    const { currentRound, mappools, roles } = settings;

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first.'
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
        content: 'You do not have permission to view map suggestions. Only tournament organizers, advisors, poolers and test/replayers can access this command.'
      });
    }

    // Find the mappool for the current round
    const mappool = mappools.find(mp => mp.round === currentRound);
    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No mappool found for the current round: ${currentRound}. Remind your organizer to set up the mappool.`
      });
    }

    // Check if there are any suggestions
    if (!mappool.suggestions || mappool.suggestions.length === 0) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No suggestions have been made for the ${currentRound} mappool yet.`
      });
    }

    // Helper functions
    const extractDifficultyId = (url: string): string => {
      if (url.includes('/b/')) {
        return url.split('/b/')[1].split('?')[0].split('#')[0];
      } else {
        return url.split('#')[1].split('/')[1];
      }
    };

    const fetchBeatmapInfo = async (diffId: string) => {
      try {
        const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${diffId}`, {
          headers: {
            Authorization: `Bearer ${await ctx.client.requestV2Token()}`
          }
        });
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch beatmap ${diffId}:`, error);
        return null;
      }
    };

    // Create paginated embeds for the suggestions
    const pages = new Pagination();
    for (const suggestion of mappool.suggestions) {
      const beatmapPromises = suggestion.urls.map(url =>
        fetchBeatmapInfo(extractDifficultyId(url))
      );

      const beatmaps = await Promise.all(beatmapPromises);

      const mapsText = beatmaps.map((beatmap, index) => {
        if (!beatmap) return `- [Failed to load] ${suggestion.urls[index]}`;
        return `- [${beatmap.beatmapset.artist_unicode} - ${beatmap.beatmapset.title} [${beatmap.version}]](${suggestion.urls[index]})`;
      }).join('\n');

      const embed = new Embed()
        .setTitle(`Suggestions - ${currentRound}`)
        .setDescription(`Slot: **${suggestion.slot}**\nMaps:\n${mapsText}`)
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
