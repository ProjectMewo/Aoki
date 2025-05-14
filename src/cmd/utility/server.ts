import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  Embed,
  LocalesT,
  SubCommand,
  TextGuildChannel
} from "seyfert";

@Declare({
  name: 'server',
  description: 'get information about the server'
})
@LocalesT('utility.server.name', 'utility.server.description')
export default class Server extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.server;
    await ctx.deferReply();

    const rawGuild = ctx.interaction.guild;
    if (!rawGuild) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.notFound
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
        [t.generalInfo.owner]: ctx.client.utils.string.textTruncate(owner.username, 20),
        [t.generalInfo.roleCount]: (await guild.roles.list()).length,
        [t.generalInfo.emojiCount]: (await guild.emojis.list()).length,
        [t.generalInfo.created]: since,
        [t.generalInfo.boosts]: guild.premiumSubscriptionCount,
        [t.generalInfo.mainLocale]: guild.preferredLocale,
        [t.generalInfo.verification]: guild.verificationLevel,
        [t.generalInfo.filter]: guild.explicitContentFilter
      }, 30);

      const afkChannel = await ctx.client.channels.fetch(guild.afkChannelId || "") as TextGuildChannel;

      const channelInfoField = ctx.client.utils.string.keyValueField({
        [t.channelInfo.categories]: category,
        [t.channelInfo.textChannels]: text,
        [t.channelInfo.voiceChannels]: voice,
        [t.channelInfo.newsChannels]: news,
        [t.channelInfo.afkChannel]: afkChannel ? afkChannel.name : t.noAfkChannel
      }, 30);

      const description = `*${guild.description == null ? t.noDescription : guild.description}*\n\n`;

      // Create embed
      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: t.generalInfo.author(guild.name), iconUrl: icon })
        .setDescription(description)
        .addFields([
          { name: t.general, value: generalInfoField },
          { name: t.channel, value: channelInfoField }
        ])
        .setFooter({
          text: t.requestedBy(ctx.author.username),
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.fetchError
      });
    }
  }
}