import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createChannelOption,
  Declare,
  Locales,
  Options,
  SubCommand
} from "seyfert";
import { ChannelType, PermissionFlagsBits } from "seyfert/lib/types";

const options = {
  channel: createChannelOption({
    description: 'the channel to send beatmap timestamps to',
    description_localizations: meta.osu.timestamp_channel.channel,
    required: true,
    channel_types: [ChannelType.GuildText]
  })
};

@Declare({
  name: 'add_timestamp_channel',
  description: 'add a channel for detecting osu! editor timestamps'
})
@Locales(meta.osu.timestamp_channel.loc)
@Options(options)
export default class TimestampChannel extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.timestampChannel;
    const channel = ctx.options.channel;

    // Check if the user has the required permissions
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const member = await guild.members.fetch(ctx.author.id);
    if (!(await member?.fetchPermissions()).has([PermissionFlagsBits.ManageChannels])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    // Check if the bot has the required permissions
    const botMember = await guild.members.fetch(ctx.client.botId);
    if (!(await botMember?.fetchPermissions()).has([PermissionFlagsBits.ViewChannel])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.botNoViewPermission
      });
    }
    if (!(await botMember?.fetchPermissions()).has([PermissionFlagsBits.SendMessages])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.botNoSendPermission
      });
    }

    // Save the channel
    const currentChannels = guild.settings.timestampChannel || [];
    if (!Array.isArray(currentChannels)) {
      ctx.client.logger.fatal(`Expected an array for currentChannels on guild ${ctx.guildId}`);
      return AokiError.INTERNAL({
        sender: ctx.interaction,
        content: t.internalError
      });
    }

    if (currentChannels.includes(channel.id)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.alreadyExists(channel.id)
      });
    }

    currentChannels.push(channel.id);
    await guild.update({ timestampChannel: currentChannels });

    await ctx.editOrReply({
      content: t.added(channel.id)
    });
  }
}
