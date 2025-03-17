import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Server extends Subcommand {
  constructor() {
    super({
      name: 'server',
      description: 'get information about the server',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    if (!i.guild) {
      throw new Error("Guild not found.");
    }
    
    const guild = i.guild;
    const owner = await i.client.users.fetch(guild.ownerId);
    const icon = guild.iconURL({ size: 1024 }) || "https://i.imgur.com/AWGDmiu.png";
    
    // shortcuts
    const since = i.client.utils.time.formatDate(new Date(guild.createdAt), 'MMMM yyyy');
    const channelTypeCount = (type: number): number => guild.channels.cache.filter((channel: any) => channel.type === type).size;
    const text = channelTypeCount(0);
    const voice = channelTypeCount(2);
    const category = channelTypeCount(4);
    const news = channelTypeCount(5);
    
    const generalInfoField = i.client.utils.string.keyValueField({
      "Owner": i.client.utils.string.textTruncate(owner.username, 20),
      "Role Count": guild.roles.cache.size,
      "Emoji Count": guild.emojis.cache.size,
      "Created": since,
      "Boosts": guild.premiumSubscriptionCount,
      "Main Locale": guild.preferredLocale,
      "Verification": guild.verificationLevel,
      "Filter": guild.explicitContentFilter
    }, 30);
    
    const channelInfoField = i.client.utils.string.keyValueField({
      "Categories": category,
      "Text Channels": text,
      "Voice Channels": voice,
      "News Channels": news,
      "AFK Channel": guild.afkChannel ? guild.afkChannel.name : "None"
    }, 30);
    
    const description = `*${guild.description == null ? "Server has no description." : guild.description}*\n\n`;
    
    // make embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: guild.name, iconURL: icon })
      .setDescription(description)
      .addFields([
        { name: "General Info", value: generalInfoField },
        { name: "Channels Info", value: channelInfoField }
      ])
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}