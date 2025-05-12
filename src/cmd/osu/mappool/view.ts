import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Embed,
  Group,
  SubCommand
} from "seyfert";

@Declare({
  name: 'view',
  description: 'view the finalized mappool for the current round.'
})
@Group('mappool')
export default class View extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    // Check user permissions
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
        content: 'You do not have permission to view the mappool. Only hosts, advisors, mappoolers, and test/replayers can access this command.'
      });
    }

    // Check if a current round is set
    const { currentRound, mappools } = settings;
    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.'
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

    // Check if there are any confirmed maps
    if (!mappool.maps || mappool.maps.length === 0) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No maps have been confirmed for the ${currentRound} mappool yet.`
      });
    }

    // Function to extract difficulty ID from osu! beatmap URL
    const extractDifficultyId = (url: string): string => {
      if (url.includes('/b/')) {
        return url.split('/b/')[1].split('?')[0].split('#')[0];
      } else {
        return url.split('#')[1].split('/')[1];
      }
    };

    // Function to fetch beatmap data
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

    // Fetch all beatmap details and create description
    const mapDetails = [];
    for (const map of mappool.maps) {
      try {
        const beatmap = await fetchBeatmapInfo(extractDifficultyId(map.url));
        if (beatmap) {
          mapDetails.push(`**${map.slot}**: [${beatmap.beatmapset.artist_unicode} - ${beatmap.beatmapset.title} [${beatmap.version}]](${beatmap.url})`);
        } else {
          mapDetails.push(`**${map.slot}**: [Map information unavailable](${map.url})`);
        }
      } catch (error) {
        mapDetails.push(`**${map.slot}**: [Error fetching map details](${map.url})`);
      }
    }

    // Create a single embed with all maps
    const embed = new Embed()
      .setTitle(`Finalized picks for ${currentRound}`)
      .setDescription(mapDetails.join('\n'))
      .setColor(10800862)
      .setTimestamp();

    // Send the embed
    await ctx.editOrReply({ embeds: [embed] });
  }
}
