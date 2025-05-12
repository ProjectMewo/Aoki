import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createChannelOption,
  Declare,
  Options,
  SubCommand
} from "seyfert";
import { ChannelType, PermissionFlagsBits } from "seyfert/lib/types";

const options = {
  channel: createChannelOption({
    description: 'the channel to send beatmap timestamps to',
    required: true,
    channel_types: [ChannelType.GuildText]
  })
};

@Declare({
  name: 'add_timestamp_channel',
  description: 'add a channel for detecting osu! editor timestamps'
})
@Options(options)
export default class TimestampChannel extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const channel = ctx.options.channel;

    // Check if the user has the required permissions
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const member = await guild.members.fetch(ctx.author.id);
    if (!(await member?.fetchPermissions()).has([PermissionFlagsBits.ManageChannels])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: "Baka, you don't have the **Manage Channels** permission. You can't edit this setting."
      });
    }

    // Check if the bot has the required permissions
    const botMember = await guild.members.fetch(ctx.client.botId);
    if (!(await botMember?.fetchPermissions()).has([PermissionFlagsBits.ViewChannel])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: "Baka, I can't see that channel. Enable **View Channel** in permissions view, please."
      });
    }
    if (!(await botMember?.fetchPermissions()).has([PermissionFlagsBits.SendMessages])) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please."
      });
    }

    // Save the channel
    const currentChannels = guild.settings.timestampChannel || [];
    if (!Array.isArray(currentChannels)) {
      ctx.client.logger.fatal(`Expected an array for currentChannels on guild ${ctx.guildId}`);
      return AokiError.INTERNAL({
        sender: ctx.interaction,
        content: "My sensei messed up. They're notified, please do this again tomorrow.\n\nSorry for the inconvenience."
      });
    }

    if (currentChannels.includes(channel.id)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `The channel <#${channel.id}> is already in the list of timestamp channels.`
      });
    }

    currentChannels.push(channel.id);
    await guild.update({ timestampChannel: currentChannels });

    await ctx.editOrReply({
      content: `Added <#${channel.id}> to the list of timestamp channels.`
    });
  }
}
