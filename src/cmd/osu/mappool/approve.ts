import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  slot: createStringOption({
    description: 'the slot to add this map to',
    description_localizations: {
      "en-US": 'the slot to add this map to',
      "vi": 'vị trí để thêm map này'
    },
    required: true
  }),
  url: createStringOption({
    description: 'the beatmap URL (must include difficulty ID)',
    description_localizations: {
      "en-US": 'the beatmap URL (must include difficulty ID)',
      "vi": 'URL của map (phải bao gồm ID độ khó)'
    },
    required: true
  })
};

@Declare({
  name: 'approve',
  description: 'approve a map and move it to the current round\'s finalized mappool.'
})
@Locales({
  name: [
    ['en-US', 'approve'],
    ['vi', 'duyệt']
  ],
  description: [
    ['en-US', 'approve a map and move it to the current round\'s finalized mappool.'],
    ['vi', 'duyệt một map và chuyển nó vào mappool đã chốt của vòng hiện tại.']
  ]
})
@Group('mappool')
@Options(options)
export default class Approve extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.mappool.approve;
    const { slot, url } = ctx.options;

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
        content: t.noPermission
      });
    }

    // Check if a current round is set
    const { currentRound, mappools } = settings;
    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noActiveRound
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

    // Check if the slot exists in the mappool
    if (!mappool.slots.includes(slot)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidSlot(slot, mappool.slots, currentRound)
      });
    }

    // Validate beatmap URL format
    const fullUrlPattern = /^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#(?:osu|taiko|fruits|mania)\/\d+$/i;
    const shortUrlPattern = /^https?:\/\/osu\.ppy\.sh\/b\/\d+$/i;

    if (!fullUrlPattern.test(url) && !shortUrlPattern.test(url)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidUrl
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
        content: t.fetchError
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
        content: t.mapUpdated(mapInfo.beatmapset.title, url, slot, currentRound)
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
        content: t.mapAdded(mapInfo.beatmapset.title, url, slot, currentRound)
      });
    }
  }
}
