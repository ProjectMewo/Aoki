import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createChannelOption,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";
import { ChannelType } from "seyfert/lib/types";

const options = {
  channel: createChannelOption({
    description: 'The channel to set for replays',
    required: true,
    channel_types: [ChannelType.GuildText]
  }),
  round: createStringOption({
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
  })
};

@Declare({
  name: 'set-replay-channel',
  description: 'set a channel for replays for a specific round'
})
@Group('tourney')
@Options(options)
export default class SetReplayChannel extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { channel, round } = ctx.options;

    await ctx.deferReply();

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    const existingRound = settings.mappools.find(mp => mp.round === round);
    if (!existingRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `The round "${round}" does not exist in the tournament. Please add it first.`
      });
    }

    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to set the replay channel. Only hosts and advisors can do this.'
      });
    }

    existingRound.replayChannelId = channel.id;
    await guild.update({ tournament: settings });

    await ctx.editOrReply({
      content: `Replays for the **${round}** round will now be sent to <#${channel.id}>.`
    });
  }
}
