import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  version as DiscordVersion 
} from "discord.js";
import * as os from "os";
import pkg from "../../../package.json";

export default class Stats extends Subcommand {
  constructor() {
    super({
      name: 'stats',
      description: 'get the bot\'s statistics',
      permissions: [],
      options: []
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    // Check cache first
    const cacheEntry = i.client.statsCache.get(i.user.id);
    const cacheTTL = 10 * 60 * 1000; // 10 minutes
    
    if (cacheEntry && (Date.now() - cacheEntry.timestamp < cacheTTL)) {
      await i.reply({ embeds: [cacheEntry.embed] });
      return;
    }
    
    // Defer reply since gathering stats might take time
    await i.deferReply();
    
    // Gather system stats
    const totalMem: number = os.totalmem();
    const freeMem: number = os.freemem();
    const usedMem: number = totalMem - freeMem;
    const memUsage: string = `${(usedMem / 1024 / 1024).toFixed(2)}MB`;
    const cpuLoad: number = os.loadavg()[0];
    const uptime: string = `${(os.uptime() / 3600).toFixed(2)}h`;
    const processMemUsage: string = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB';
    
    // Create formatted fields
    const techField = i.client.utils.string.keyValueField({
      'RAM': `${(totalMem / 1024 / 1024).toFixed(2)}MB`,
      'Free': `${(freeMem / 1024 / 1024).toFixed(2)}MB`,
      'Used Total': memUsage,
      'Process Use': processMemUsage,
      'CPU Load': `${cpuLoad}%`,
      'System Uptime': uptime
    }, 25);
    
    const botField = i.client.utils.string.keyValueField({
      'Client Version': pkg.version,
      'My Uptime': i.client.utils.time.msToTimeString(i.client.uptime),
      'Server Count': i.client.utils.string.commatize(i.client.guilds.cache.size),
      'Channel Count': i.client.utils.string.commatize(i.client.channels.cache.size),
      'Unique Users': i.client.utils.string.commatize(i.client.users.cache.size),
      'Emoji Count': i.client.utils.string.commatize(i.client.emojis.cache.size)
    }, 25);
    
    // Description with system info
    const description: string = [
      `- **Linux Kernel** v${os.release()}`,
      `- **Node** ${process.version}`,
      `- **Discord.js** v${DiscordVersion}`,
      `- **CPU**: ${os.cpus()[0].model} \`[ ${os.cpus()[0].speed / 1000} GHz ]\``
    ].join("\n");
    
    // Create embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: "Raw Statistics", iconURL: i.client.user!.displayAvatarURL() })
      .setDescription(description)
      .setFooter({ text: "Probably a moron" })
      .addFields([
        { name: 'System', value: techField, inline: true },
        { name: 'Client', value: botField, inline: true }
      ])
      .setTimestamp();

    // Store in cache
    i.client.statsCache.set(i.user.id, { embed, timestamp: Date.now() });
    
    // Send response
    await i.editReply({ embeds: [embed] });
  }
}