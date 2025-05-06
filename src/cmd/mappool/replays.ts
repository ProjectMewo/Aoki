import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, GuildMemberRoleManager } from "discord.js";

export default class Replays extends Subcommand {
  constructor() {
    super({
      name: 'replays',
      description: 'view saved replays for a specific round or the current mappool',
      permissions: ['ManageGuild'],
      options: [
        {
          type: 'string',
          name: 'round',
          description: 'the round to view replays for',
          required: false,
          choices: [
            { name: 'Qualifiers', value: 'Qualifiers' },
            { name: 'Group Stage', value: 'Group Stage' },
            { name: 'Round of 32', value: 'Round of 32' },
            { name: 'Round of 16', value: 'Round of 16' },
            { name: 'Quarterfinals', value: 'Quarterfinals' },
            { name: 'Semifinals', value: 'Semifinals' },
            { name: 'Finals', value: 'Finals' },
            { name: 'Grand Finals', value: 'Grand Finals' }
          ]
        }
      ]
    });
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    const settings = i.guild!.settings.tournament;

    if (!settings.name) {
      await i.editReply({ content: 'No tournament exists in this server. Create one with `/tourney make` first.' });
      return;
    }

    // Check permissions
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.streamer,
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
      await i.editReply({ content: 'You do not have permission to view replays. Only tournament organizers, advisors, streamers, and replayers can access this command.' });
      return;
    }

    const round = i.options.getString('round') || settings.currentRound;

    if (!round) {
      await i.editReply({ content: 'No round is currently active, and no round was specified. Remind the organizer to set up the current round by doing `/tourney current`.' });
      return;
    }

    const mappool = settings.mappools.find(mp => mp.round === round);

    if (!mappool) {
      await i.editReply({ content: `No mappool found for the round: ${round}. Remind the organizer to set up the current mappool for this round by doing \`/tourney add-round\`.` });
      return;
    }

    if (!mappool.replays.length) {
      await i.editReply({ content: `No replays have been saved for the round: ${round}.` });
      return;
    }

    const replyContent = `**Replays for ${round}:**\n` +
      mappool.replays
        .map(replay => `- [Replay for ${replay.slot}](${replay.messageUrl}) by **${replay.replayer}**`)
        .join('\n');

    await i.editReply({ content: replyContent });
  }
}