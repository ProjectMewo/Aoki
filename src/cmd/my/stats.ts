import { CommandContext, Declare, Embed, SubCommand } from "seyfert";
import os from 'os';
import * as pkg from "../../../package.json";

@Declare({
  name: "stats",
  description: "the nerdy statistics of how I'm working."
})
export default class Stats extends SubCommand {
  async run(ctx: CommandContext) {
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    // Initialize statsCache if it doesn't exist
    if (!ctx.client.statsCache) {
      ctx.client.statsCache = {
        data: {
          techField: "",
          appField: "",
          description: "",
          embedTimestamp: new Date,
        },
        lastUpdated: 0
      };
    }

    const now = Date.now();

    // Check if cached data is still valid
    if (ctx.client.statsCache.lastUpdated && now - ctx.client.statsCache.lastUpdated < CACHE_DURATION) {
      // Use cached data
      const cachedData = ctx.client.statsCache.data;
      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: "Raw Statistics", iconUrl: ctx.client.me!.avatarURL() })
        .setDescription(cachedData.description)
        .setFooter({ text: "Probably a moron" })
        .addFields([
          { name: 'System', value: cachedData.techField, inline: true },
          { name: 'App', value: cachedData.appField, inline: true }
        ])
        .setTimestamp(cachedData.embedTimestamp);

      await ctx.editOrReply({ embeds: [embed] });
      return;
    }

    // Defer reply since gathering stats might take time
    await ctx.deferReply();

    // Gather system stats
    const totalMem: number = os.totalmem();
    const freeMem: number = os.freemem();
    const usedMem: number = totalMem - freeMem;
    const memUsage: string = `${(usedMem / 1024 / 1024).toFixed(2)}MB`;
    const cpuLoad: number = os.loadavg()[0];
    const uptime: string = `${(os.uptime() / 3600).toFixed(2)}h`;
    const processMemUsage: string = (process.memoryUsage().rss / 1024 / 1024).toFixed(2) + 'MB';

    // Create formatted fields
    const techField = ctx.client.utils.string.keyValueField({
      'RAM': `${(totalMem / 1024 / 1024).toFixed(2)}MB`,
      'Free': `${(freeMem / 1024 / 1024).toFixed(2)}MB`,
      'Used Total': memUsage,
      'Process Use': processMemUsage,
      'CPU Load': `${cpuLoad}%`,
      'System Uptime': uptime
    }, 25);

    const guilds = await ctx.client.guilds.list();
    let userCount = 0;

    for (const guild of guilds) {
      const fetchedGuild = await guild.fetch();
      const members = fetchedGuild.memberCount;
      userCount += members || 0;
    }

    const clientUptime = `${ctx.client.utils.time.msToTimeString(Date.now() - ctx.client.startTime)}`;

    const appField = ctx.client.utils.string.keyValueField({
      'Client Version': `${pkg.version}`,
      'Client Uptime': `${clientUptime}`,
      'Commands': `${ctx.client.commands.values.length}`,
      'Servers': `${guilds.length}`,
      'Users': `${userCount}`,
      'Avg. User/Server': `${(userCount / guilds.length).toFixed(0)}`
    }, 25);

    // Description with system info
    const description: string = [
      `- **Linux Kernel** v${os.release()}`,
      `- **Node** ${process.version}`,
      `- **Seyfert** v${pkg.dependencies.seyfert.replace("^", "")}`,
      `- **CPU**: ${os.cpus()[0].model} \`[${os.cpus()[0].speed / 1000 || "Unknown"} GHz]\``
    ].join("\n");

    // Cache the data
    ctx.client.statsCache = {
      data: {
        techField,
        appField,
        description,
        embedTimestamp: new Date()
      },
      lastUpdated: now
    };

    // Create embed
    const embed = new Embed()
      .setColor(10800862)
      .setAuthor({ name: "Raw Statistics", iconUrl: ctx.client.me!.avatarURL() })
      .setDescription(description)
      .setFooter({ text: "Probably a moron" })
      .addFields([
        { name: 'System', value: techField, inline: true },
        { name: 'App', value: appField, inline: true }
      ])
      .setTimestamp();

    // Send response
    await ctx.editOrReply({ embeds: [embed] });
  }
}
