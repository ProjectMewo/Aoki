import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Embed,
  SubCommand,
  TextGuildChannel
} from "seyfert";

@Declare({
  name: 'server',
  description: 'get information about the server'
})
export default class Server extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    const rawGuild = ctx.interaction.guild;
    if (!rawGuild) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Guild not found."
      });
    }

    try {
      const guild = await ctx.client.guilds.fetch(rawGuild.id);
      const owner = await ctx.client.users.fetch(guild.ownerId);
      const icon = guild.iconURL({ size: 1024 }) || "https://i.imgur.com/AWGDmiu.png";

      // Shortcuts
      const since = ctx.client.utils.time.formatDate(new Date(guild.createdAt), 'MMMM yyyy');
      const channelTypeCount = async (type: number): Promise<number> =>
        (await guild.channels.list()).filter((channel: any) => channel.type === type).length;
      const text = channelTypeCount(0);
      const voice = channelTypeCount(2);
      const category = channelTypeCount(4);
      const news = channelTypeCount(5);

      const generalInfoField = ctx.client.utils.string.keyValueField({
        "Owner": ctx.client.utils.string.textTruncate(owner.username, 20),
        "Role Count": (await guild.roles.list()).length,
        "Emoji Count": (await guild.emojis.list()).length,
        "Created": since,
        "Boosts": guild.premiumSubscriptionCount,
        "Main Locale": guild.preferredLocale,
        "Verification": guild.verificationLevel,
        "Filter": guild.explicitContentFilter
      }, 30);

      const afkChannel = await ctx.client.channels.fetch(guild.afkChannelId || "") as TextGuildChannel;

      const channelInfoField = ctx.client.utils.string.keyValueField({
        "Categories": category,
        "Text Channels": text,
        "Voice Channels": voice,
        "News Channels": news,
        "AFK Channel": afkChannel ? afkChannel.name : "None"
      }, 30);

      const description = `*${guild.description == null ? "Server has no description." : guild.description}*\n\n`;

      // Create embed
      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: guild.name, iconUrl: icon })
        .setDescription(description)
        .addFields([
          { name: "General Info", value: generalInfoField },
          { name: "Channels Info", value: channelInfoField }
        ])
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to fetch server information. Please try again later."
      });
    }
  }
}