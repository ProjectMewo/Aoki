import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Embed,
  Group,
  Locales,
  SubCommand
} from "seyfert";

@Declare({
  name: 'view',
  description: 'view the finalized mappool for the current round.'
})
@Locales({
  name: [
    ['en-US', 'view'],
    ['vi', 'xem']
  ],
  description: [
    ['en-US', 'view the finalized mappool for the current round.'],
    ['vi', 'xem mappool đã chốt cho vòng hiện tại.']
  ]
})
@Group('mappool')
export default class View extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.mappool.view;
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

    // Check if there are any confirmed maps
    if (!mappool.maps || mappool.maps.length === 0) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noMaps(currentRound)
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
          const slot = map.slot;
          const artist = beatmap.beatmapset.artist_unicode;
          const title = beatmap.beatmapset.title;
          const version = beatmap.beatmapset.version;
          const url = beatmap.url;
          let od, hp, sr;
          // taiko specific
          const diffAttr = async (diffId: string, mods: (number | string)[]) => {
            try {
              const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${diffId}/attributes`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await ctx.client.requestV2Token()}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ mods })
              });
              return await response.json();
            } catch (error) {
              console.error(`Failed to fetch beatmap attributes for ${diffId}:`, error);
              return null;
            }
          };
          // taiko specific
          const mods = [];
          if (map.slot.includes("HR")) mods.push("HR");
          if (map.slot.includes("DT") || map.slot.includes("NC")) mods.push("DT");

          const attr = mods.length > 0 ? await diffAttr(extractDifficultyId(map.url), mods) : null;

          od = mods.includes("HR")
            ? Math.min(beatmap.accuracy * 1.4, 10)
            : mods.includes("DT")
              ? 50 - ((50 - 3 * beatmap.accuracy) / 1.5)
              : beatmap.accuracy;

          hp = mods.includes("HR")
            ? beatmap.drain * 1.4
            : beatmap.drain;

          sr = attr ? attr.star_rating : beatmap.difficulty_rating;
          // end taiko specific
          mapDetails.push(t.mapDetails(slot, artist, title, version, url, od, hp, sr));
        } else {
          mapDetails.push(t.mapUnavailable(map.slot, map.url));
        }
      } catch (error) {
        mapDetails.push(t.mapError(map.slot, map.url));
      }
    }

    // Create a single embed with all maps
    const embed = new Embed()
      .setTitle(t.embedTitle(currentRound))
      .setDescription(mapDetails.join('\n'))
      .setColor(10800862)
      .setTimestamp();

    // Send the embed
    await ctx.editOrReply({ embeds: [embed] });
  }
}
