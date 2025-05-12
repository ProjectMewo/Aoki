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
  slot: createStringOption({
    description: 'the slot to add this map to',
    required: true
  }),
  url: createStringOption({
    description: 'the beatmap URL (must include difficulty ID)',
    required: true
  })
};

@Declare({
  name: 'approve',
  description: 'approve a map and move it to the current round\'s finalized mappool'
})
@Group('mappool')
@Options(options)
export default class Approve extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { slot, url } = ctx.options;

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

    // Check permission - only hosts, advisors, and mappoolers can add maps
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
        content: 'You do not have permission to add maps to the mappool. Only hosts, advisors and mappoolers can do this.'
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
        content: `No mappool found for the current round: ${currentRound}. Create it first with \`/tourney add-round\`.`
      });
    }

    // Check if the slot exists in the mappool
    if (!mappool.slots.includes(slot)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `The slot "${slot}" doesn't exist in the ${currentRound} mappool. Available slots: ${mappool.slots.join(', ')}`
      });
    }

    // Validate beatmap URL format
    const fullUrlPattern = /^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#(?:osu|taiko|fruits|mania)\/\d+$/i;
    const shortUrlPattern = /^https?:\/\/osu\.ppy\.sh\/b\/\d+$/i;

    if (!fullUrlPattern.test(url) && !shortUrlPattern.test(url)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'Invalid beatmap URL. Please provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).'
      });
    }

    // Extract difficulty ID from osu! beatmap URL
    const extractDifficultyId = (url: string): string => {
      if (url.includes('/b/')) {
        return url.split('/b/')[1].split('?')[0].split('#')[0];
      } else {
        return url.split('#')[1].split('/')[1];
      }
    };

    // Fetch beatmap data
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

    const diffId = extractDifficultyId(url);
    const mapInfo = await fetchBeatmapInfo(diffId);

    if (!mapInfo) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: 'Failed to fetch beatmap information. Please try again later.'
      });
    }

    // Check if map already exists for this slot
    const existingMap = mappool.maps.find(m => m.slot === slot);
    if (existingMap) {
      // Update existing map
      existingMap.url = url;
      await guild.update({
        tournament: settings
      });

      await ctx.editOrReply({
        content: `Updated [${mapInfo.beatmapset.title}](${url}) for **${slot}** in the ${currentRound} mappool.`
      });
    } else {
      // Add new map
      mappool.maps.push({
        slot,
        url,
        fullRecognizer: `${mapInfo.beatmapset.artist} - ${mapInfo.beatmapset.title} [${mapInfo.version}]`
      });

      await guild.update({
        tournament: settings
      });

      await ctx.editOrReply({
        content: `Added [${mapInfo.beatmapset.title}](${url}) for **${slot}** to the ${currentRound} mappool.`
      });
    }
  }
}
