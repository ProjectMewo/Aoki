import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createChannelOption,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";
import { ChannelType } from "seyfert/lib/types";

const options = {
  channel: createChannelOption({
    description: 'the channel to set for replays',
    description_localizations: meta.osu.tourney.set_replay_channel.channel,
    required: true,
    channel_types: [ChannelType.GuildText]
  }),
  round: createStringOption({
    description: 'the round this channel is for',
    description_localizations: meta.osu.tourney.set_replay_channel.round,
    required: true,
    autocomplete: async (i) => await SetReplayChannel.prototype.autocomplete(i)
  })
};

@Declare({
  name: 'set-replay-channel',
  description: 'set a channel for replays for a specific round'
})
@Locales(meta.osu.tourney.set_replay_channel.loc)
@Group('tourney')
@Options(options)
export default class SetReplayChannel extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    // fetch the rounds of this tournament
    const guild = await interaction.client.guilds.fetch(interaction.guildId!);
    const rounds = guild.settings.tournament.mappools.map((mappool) => ({
      name: mappool.round,
      value: mappool.round
    }));
    // serve to user
    await this.respondWithLocalizedChoices(
      interaction,
      rounds
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.setReplayChannel;
    const { channel, round } = ctx.options;

    await ctx.deferReply();

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    const existingRound = settings.mappools.find(mp => mp.round === round);
    if (!existingRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.roundNotFound(round)
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
        content: t.noPermission
      });
    }

    existingRound.replayChannelId = channel.id;
    await guild.update({ tournament: settings });

    await ctx.editOrReply({
      content: t.success(round, channel.id)
    });
  }
}
