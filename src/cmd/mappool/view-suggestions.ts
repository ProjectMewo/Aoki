import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import Pagination from "@struct/Paginator";
import AokiClient from "@struct/Client";

export default class ViewSuggestions extends Subcommand {
  constructor() {
    super({
      name: 'view-suggestions',
      description: 'view all map suggestions for the current round.',
      permissions: [],
      options: []
    });
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Check if there is an active round
    const settings = i.guild!.settings.tournament;
    const { currentRound, mappools, roles } = settings;

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: i,
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
        content: 'You do not have permission to view map suggestions. Only tournament organizers, advisors, poolers, and replayers can access this command.'
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

    // Check if there are any suggestions
    if (!mappool.suggestions || mappool.suggestions.length === 0) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `No suggestions have been made for the ${currentRound} mappool yet.`
      });
    }

    // Create paginated embeds for the suggestions
    function extractDifficultyId(url: string): string {
      if (url.includes('/b/')) {
        return url.split('/b/')[1].split('?')[0].split('#')[0];
      } else {
        return url.split('#')[1].split('/')[1];
      }
    }

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

    const pages = new Pagination();
    for (const suggestion of mappool.suggestions) {
      const beatmapPromises = suggestion.urls.map(url =>
        fetchBeatmapInfo(extractDifficultyId(url)));

      const beatmaps = await Promise.all(beatmapPromises);

      const mapsText = beatmaps.map((beatmap, index) => {
        if (!beatmap) return `- [Failed to load] ${suggestion.urls[index]}`;
        return `- [${beatmap.beatmapset.artist_unicode} - ${beatmap.beatmapset.title} [${beatmap.version}]](${suggestion.urls[index]})`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`Suggestions - ${currentRound}`)
        .setDescription(`Slot: **${suggestion.slot}**\nMaps:\n${mapsText}`)
        .setColor(10800862)
        .setTimestamp();

      pages.add(embed);
    }

    await pages.handle({
      sender: i,
      filter: 'userOnly',
      time: 90000
    });
  }
}
