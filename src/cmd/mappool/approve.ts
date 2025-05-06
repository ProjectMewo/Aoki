import AokiClient from "@struct/Client";
import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager } from "discord.js";

export default class Approve extends Subcommand {
  constructor() {
    super({
      name: 'approve',
      description: 'approve a map and move it to the current round\'s finalized mappool',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'slot',
          description: 'the slot to add this map to',
          required: true
        },
        {
          type: 'string',
          name: 'url',
          description: 'the beatmap URL (must include difficulty ID)',
          required: true
        }
      ]
    })
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const slot = i.options.getString('slot', true);
    const url = i.options.getString('url', true);
    
    // Get tournament settings
    const settings = i.guild!.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    // Check permission - only hosts, advisors, and mappoolers can add maps
    const permittedRoles = [
      ...settings.roles.host, 
      ...settings.roles.advisor, 
      ...settings.roles.mappooler
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
        content: 'You do not have permission to add maps to the mappool. Only hosts, advisors, and mappoolers can do this.'
      });
    }

    // Check if a current round is set
    const { currentRound, mappools } = settings;
    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.'
      });
    }

    // Find the mappool for the current round
    const mappool = mappools.find(mp => mp.round === currentRound);
    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `No mappool found for the current round: ${currentRound}. Create it first with \`/tourney add-round\`.`
      });
    }

    // Check if the slot exists in the mappool
    if (!mappool.slots.includes(slot)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: `The slot "${slot}" doesn't exist in the ${currentRound} mappool. Available slots: ${mappool.slots.join(', ')}`
      });
    }

    // Validate beatmap URL format (both full and shortened formats)
    const fullUrlPattern = /^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#(?:osu|taiko|fruits|mania)\/\d+$/i;
    const shortUrlPattern = /^https?:\/\/osu\.ppy\.sh\/b\/\d+$/i;
    
    if (!fullUrlPattern.test(url) && !shortUrlPattern.test(url)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'Invalid beatmap URL. Please provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).\b\bURL schemes starting with <https://osu.ppy.sh/beatmap> is not allowed due to current limitations.'
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

    // Check if map already exists for this slot
    const existingMap = mappool.maps.find(m => m.slot === slot);
    // Also get the beatmap info to use
    const mapInfo = await fetchBeatmapInfo(extractDifficultyId(url))
    if (existingMap) {
      // Update existing map
      existingMap.url = url;
      await i.guild!.update({
        tournament: settings
      });
      
      await i.editReply({
        content: `Updated [${mapInfo.beatmapset.title}](${url}) for **${slot}** in the ${currentRound} mappool.`
      });
      return;
    } else {
      // Add new map
      mappool.maps.push({
        slot,
        url,
        fullRecognizer: `${mapInfo.beatmapset.artist} - ${mapInfo.beatmapset.title} [${mapInfo.version}]`
      });
      
      await i.guild!.update({
        tournament: settings
      });
      
      await i.editReply({
        content: `Added [${mapInfo.beatmapset.title}](${url}) for **${slot}** to the ${currentRound} mappool.`
      });
      return;
    }
  }
}
