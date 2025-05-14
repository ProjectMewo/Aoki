import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  PermissionFlagsBits, 
  TextChannel 
} from "discord.js";

export default class TimestampChannel extends Subcommand {
  constructor() {
    super({
      name: 'set_timestamp_channel',
      description: 'set the channel for osu! beatmap timestamps',
      permissions: ['ManageChannels'],
      options: [
        {
          type: 'channel',
          name: 'channel',
          description: 'the channel to send beatmap timestamps to',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const channel = i.options.getChannel("channel")!;
    
    // Cast channel to TextChannel
    const textChannel = channel as TextChannel;
    
    // Check if channel is of text type
    if (textChannel.type != 0) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Baka, this feature can only be toggled in text channels."
      });
    }
    
    // Check if the member who executed this was an admin/mod
    if (!textChannel.permissionsFor(i.guild!.members.cache.get(i.user.id)!).has(PermissionFlagsBits.ManageChannels)) {
      return AokiError.PERMISSION({
        sender: i,
        content: "Baka, you don't have the **Manage Channels** permission. You can't edit this settings."
      });
    }
    
    // Check if we have permission to see the channel
    if (!textChannel.permissionsFor(i.guild!.members.me!).has(PermissionFlagsBits.ViewChannel)) {
      return AokiError.PERMISSION({
        sender: i,
        content: "Baka, I can't see that channel. Enable **View Channel** in permissions view, please."
      });
    }
    
    // Check if we have permissions to send messages in there
    if (!textChannel.permissionsFor(i.guild!.members.me!).has(PermissionFlagsBits.SendMessages)) {
      return AokiError.PERMISSION({
        sender: i,
        content: "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please."
      });
    }
    
    // Save the channel
    await i.guild!.update({ timestampChannel: textChannel.id });
    
    await i.editReply({ content: `Updated the timestamp channel to <#${textChannel.id}>.` });
  }
}