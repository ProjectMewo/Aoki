import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import AokiClient from "@struct/Client";

export default class View extends Subcommand {
  constructor() {
    super({
      name: 'view',
      description: 'view the finalized mappool for the current round.',
      permissions: [],
      options: []
    });
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Check if the user has the required roles
    const settings = i.guild!.settings.tournament;
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.mappooler,
      ...settings.roles.testReplayer
    ];

    let userRoles;
    if (i.member!.roles instanceof GuildMemberRoleManager) {
      userRoles = i.member!.roles.cache.map(role => role.id);
    } else {
      userRoles = i.member!.roles;
    }

    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));
    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: i,
        content: 'You do not have permission to view the mappool. Only hosts, advisors, mappoolers and test/replayers can access this command.'
      });
    }

    // Check if there is an active round
    const { currentRound, mappools } = settings;

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first.'
      });
    }

    // Find the mappool for the current round
    const mappool = mappools.find(mp => mp.round === currentRound);
    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `No mappool found for the current round: ${currentRound}. Remind your organizer to set up the mappool.`
      });
    }

    // Check if there are any confirmed maps
    if (!mappool.maps || mappool.maps.length === 0) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `No maps have been confirmed for the ${currentRound} mappool yet.`
      });
    }

    // Function to extract difficulty ID from osu! beatmap URL
    function extractDifficultyId(url: string): string {
      if (url.includes('/b/')) {
        return url.split('/b/')[1].split('?')[0].split('#')[0];
      } else {
        return url.split('#')[1].split('/')[1];
      }
    }

    // Function to fetch beatmap data
    async function fetchBeatmapInfo(diffId: string) {
      try {
        const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${diffId}`, {
          headers: {
            Authorization: `Bearer ${await (i.client as AokiClient).requestV2Token()}`
          }
        });
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch beatmap ${diffId}:`, error);
        return null;
      }
    }

    await i.deferReply();
    
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
    const embed = new EmbedBuilder()
      .setTitle(`Finalized picks for ${currentRound}`)
      .setDescription(mapDetails.join('\n'))
      .setColor(10800862)
      .setTimestamp();

    // Send the embed
    await i.editReply({ embeds: [embed] });
  }
}
