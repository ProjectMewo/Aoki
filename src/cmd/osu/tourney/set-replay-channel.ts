import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createChannelOption,
  createStringOption,
  Declare,
  Group,
  LocalesT,
  Options,
  SubCommand,
  AutocompleteInteraction
} from "seyfert";
import { ChannelType } from "seyfert/lib/types";

const options = {
  channel: createChannelOption({
    description: 'the channel to set for replays',
    description_localizations: {
      "en-US": 'the channel to set for replays',
      "vi": 'kênh để đặt cho phát lại'
    },
    required: true,
    channel_types: [ChannelType.GuildText]
  }),
  round: createStringOption({
    description: 'the round this channel is for',
    description_localizations: {
      "en-US": 'the round this channel is for',
      "vi": 'vòng đấu mà kênh này dành cho'
    },
    required: true,
    autocomplete: async (interaction) => await SetReplayChannel.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: 'set-replay-channel',
  description: 'set a channel for replays for a specific round'
})
@LocalesT('osu.tourney.setReplayChannel.name', 'osu.tourney.setReplayChannel.description')
@Group('tourney')
@Options(options)
export default class SetReplayChannel extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getAutocompleteValue();
    const language = interaction.user.settings.language;

    const localizedChoices = {
      "en-US": [
        { name: 'Qualifiers', value: 'Qualifiers' },
        { name: 'Group Stage', value: 'Group Stage' },
        { name: 'Round of 32', value: 'Round of 32' },
        { name: 'Round of 16', value: 'Round of 16' },
        { name: 'Quarterfinals', value: 'Quarterfinals' },
        { name: 'Semifinals', value: 'Semifinals' },
        { name: 'Finals', value: 'Finals' },
        { name: 'Grand Finals', value: 'Grand Finals' }
      ],
      "vi": [
        { name: 'Vòng loại', value: 'Qualifiers' },
        { name: 'Vòng bảng', value: 'Group Stage' },
        { name: 'Vòng 32 đội', value: 'Round of 32' },
        { name: 'Vòng 16 đội', value: 'Round of 16' },
        { name: 'Tứ kết', value: 'Quarterfinals' },
        { name: 'Bán kết', value: 'Semifinals' },
        { name: 'Chung kết', value: 'Finals' },
        { name: 'Chung kết tổng', value: 'Grand Finals' }
      ]
    };

    const choices = localizedChoices[language] || localizedChoices["en-US"];

    if (!focusedValue) {
      return await interaction.respond(choices);
    }

    const filteredChoices = choices.filter(choice =>
      choice.name.toLowerCase().includes(focusedValue.toLowerCase())
    ).slice(0, 2);

    await interaction.respond(filteredChoices);
  }

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
