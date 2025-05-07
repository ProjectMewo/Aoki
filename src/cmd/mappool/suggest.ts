import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager, MessageFlags } from "discord.js";

export default class Suggest extends Subcommand {
  constructor() {
    super({
      name: 'suggest',
      description: 'suggest a new map for this mappool slot.',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'slot',
          description: 'the slot you want to suggest to.',
          required: true
        },
        {
          type: 'string',
          name: 'url',
          description: 'the url of the map. must include difficulty id.',
          required: true
        },
        // this switch is to make sure the suggestor knows they're doing the right thing
        {
          type: 'boolean',
          name: 'confirm',
          description: 'confirm you know the correct current round is set.',
          required: true
        }
      ]
    })
  }
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const slot = i.options.getString('slot', true);
    const url = i.options.getString('url', true);
    const confirmation = i.options.getBoolean('confirm', true);
    // if they're trolling we just end the command
    if (!confirmation) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Nice, good trolling there, you baka.\n\nOr are you genuine? Tell your organizer, or just ask me what is the current set round with `/tourney current`."
      })
    };
    // check if this user can make suggestions to mappool
    const settings = i.guild!.settings.tournament;
    /**
     * we only let:
     * - hosts
     * - advisors
     * - mappoolers
     * - test/replayers
     * suggest maps
     */
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
      userRoles = i.member!.roles
    };
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));
    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: i,
        content: 'You do not have permission to suggest maps for the mappool. Only organizers, advisors, mappoolers and test/replayers can suggest maps.'
      });
    }
    // Add code to handle the map suggestion
    const { currentRound, mappools } = settings;
    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: i,
        content: 'There is no active round set for this tournament. Remind an organizer to set the current round first.'
      });
    }

    // Find the mappool for the current round
    // If we can't find it, most likely the organizer haven't set it yet
    const mappool = mappools.find(mp => mp.round === currentRound);
    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `No mappool found for the current round: ${currentRound}.\n\nThis is important if the round exists! Remind your organizer to provide all slots of this mappool!`
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
        content: 'Invalid beatmap URL. Please provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).\n\nNote that URL scheme <https://osu.ppy.sh/beatmap> is also not supported because of current limitations.'
      });
    }

    // Find existing suggestion for this slot or create a new one
    let suggestion = mappool.suggestions.find(s => s.slot === slot);
    if (!suggestion) {
      suggestion = { slot, urls: [] };
      mappool.suggestions.push(suggestion);
    }

    // Add the URL to the suggestion if it doesn't already exist
    if (!suggestion.urls.includes(url)) {
      suggestion.urls.push(url);
      
      await i.guild!.update({
        tournament: settings
      });
      
      await i.reply({
        content: `Successfully added your suggestion for slot ${slot} in the ${currentRound} mappool.`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      await i.reply({
        content: `This map has already been suggested for slot ${slot}.`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
}