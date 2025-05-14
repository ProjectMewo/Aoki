import { Subcommand } from "@struct/handlers/Subcommand";
import AokiError from "@struct/handlers/AokiError";
import { 
  ChatInputCommandInteraction, 
  TextChannel,
  GuildMemberRoleManager 
} from "discord.js";

export default class SetReplayChannel extends Subcommand {
  constructor() {
    super({
      name: 'set-replay-channel',
      description: 'Set a channel for replays for a specific round',
      permissions: ['ManageGuild'],
      options: [
        {
          type: 'channel',
          name: 'channel',
          description: 'The channel to set for replays',
          required: true
        },
        {
          type: 'string',
          name: 'round',
          description: 'The round this channel is for',
          required: true,
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

    const channel = i.options.getChannel('channel', true) as TextChannel;
    const round = i.options.getString('round', true);

    // Validate the round exists in the tournament settings
    const settings = i.guild!.settings.tournament;
    const existingRound = settings.mappools.find(mp => mp.round === round);

    if (!existingRound) {
      await i.editReply({
        content: `The round "${round}" does not exist in the tournament. Please add it first.`
      });
      return;
    }

    // Check permission - only hosts and advisors can set this channel
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor
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
        content: 'You do not have permission to set the replay channel. Only hosts and advisors can do this.'
      });
    }

    // Update the replay channel for the round
    existingRound.replayChannelId = channel.id;
    await i.guild!.update({ tournament: settings });

    await i.editReply({ content: `Replays for the **${round}** round will now be sent to <#${channel.id}>.` });
  }
}