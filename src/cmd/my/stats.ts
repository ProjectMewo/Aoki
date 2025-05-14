import { CommandContext, Declare, Embed, LocalesT, SubCommand } from "seyfert";
import os from 'os';
import * as pkg from "../../../package.json";

@Declare({
  name: "stats",
  description: "the nerdy statistics of how I'm working."
})
@LocalesT('my.stats.name', 'my.stats.description')
export default class Stats extends SubCommand {
  async run(ctx: CommandContext) {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.stats;
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    // Initialize statsCache if it doesn't exist
    if (!ctx.client.statsCache) {
      ctx.client.statsCache = {
        data: {
          totalMem: 0,
          freeMem: 0,
          usedMem: 0,
          processMemUsage: 0,
          cpuLoad: 0,
          uptime: 0,
          clientVersion: "",
          clientUptime: "",
          commands: 0,
          servers: 0,
          users: 0,
          avgUsersPerServer: 0,
          description: "",
          embedTimestamp: new Date(),
        },
        lastUpdated: 0
      };
    }

    const now = Date.now();

    // Check if cached data is still valid
    if (ctx.client.statsCache.lastUpdated && now - ctx.client.statsCache.lastUpdated < CACHE_DURATION) {
      // Use cached data
      const cachedData = ctx.client.statsCache.data;
      const techField = ctx.client.utils.string.keyValueField({
        [t.systemField.ram]: `${(cachedData.totalMem / 1024 / 1024).toFixed(2)}MB`,
        [t.systemField.free]: `${(cachedData.freeMem / 1024 / 1024).toFixed(2)}MB`,
        [t.systemField.totalUsed]: `${(cachedData.usedMem / 1024 / 1024).toFixed(2)}MB`,
        [t.systemField.procLoad]: `${cachedData.processMemUsage.toFixed(2)}MB`,
        [t.systemField.cpuLoad]: `${cachedData.cpuLoad}%`,
        [t.systemField.sysUp]: `${(cachedData.uptime / 3600).toFixed(2)}h`
      }, 25);

      const appField = ctx.client.utils.string.keyValueField({
        [t.appField.cliVer]: cachedData.clientVersion,
        [t.appField.cliUp]: cachedData.clientUptime,
        [t.appField.cmdCount]: `${cachedData.commands}`,
        [t.appField.srvCount]: `${cachedData.servers}`,
        [t.appField.usrCount]: `${cachedData.users}`,
        [t.appField.usrOnSrvRatio]: `${cachedData.avgUsersPerServer}`
      }, 25);

      const embed = new Embed()
        .setColor(10800862)
        .setAuthor({ name: t.author, iconUrl: ctx.client.me!.avatarURL() })
        .setDescription(cachedData.description)
        .setFooter({ text: t.footer })
        .addFields([
          { name: t.system, value: techField, inline: true },
          { name: t.app, value: appField, inline: true }
        ])
        .setTimestamp(cachedData.embedTimestamp);

      await ctx.editOrReply({ embeds: [embed] });
      return;
    }

    // Defer reply since gathering stats might take time
    await ctx.deferReply();

    // Gather system stats
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const processMemUsage = process.memoryUsage().rss / 1024 / 1024;
    const cpuLoad = os.loadavg()[0];
    const uptime = os.uptime();

    const guilds = await ctx.client.guilds.list();
    let userCount = 0;

    for (const guild of guilds) {
      const fetchedGuild = await guild.fetch();
      const members = fetchedGuild.memberCount;
      userCount += members || 0;
    }

    const clientUptime = ctx.client.utils.time.msToTimeString(Date.now() - ctx.client.startTime);

    const description = [
      `- **${t.desc.linKern}** v${os.release()}`,
      `- **${t.desc.nodeVer}** ${process.version}`,
      `- **${t.desc.seyfertVer}** v${pkg.dependencies.seyfert.replace("^", "")}`,
      `- **${t.desc.cpuType}**: ${os.cpus()[0].model} \`[${os.cpus()[0].speed / 1000 || t.desc.unknownClockSpeed} GHz]\``
    ].join("\n");

    // Cache the data
    ctx.client.statsCache = {
      data: {
        totalMem,
        freeMem,
        usedMem,
        processMemUsage,
        cpuLoad,
        uptime,
        clientVersion: pkg.version,
        clientUptime,
        commands: ctx.client.commands.values.length,
        servers: guilds.length,
        users: userCount,
        avgUsersPerServer: userCount / guilds.length,
        description,
        embedTimestamp: new Date()
      },
      lastUpdated: now
    };

    // Create formatted fields
    const techField = ctx.client.utils.string.keyValueField({
      [t.systemField.ram]: `${(totalMem / 1024 / 1024).toFixed(2)}MB`,
      [t.systemField.free]: `${(freeMem / 1024 / 1024).toFixed(2)}MB`,
      [t.systemField.totalUsed]: `${(usedMem / 1024 / 1024).toFixed(2)}MB`,
      [t.systemField.procLoad]: `${processMemUsage.toFixed(2)}MB`,
      [t.systemField.cpuLoad]: `${cpuLoad}%`,
      [t.systemField.sysUp]: `${(uptime / 3600).toFixed(2)}h`
    }, 25);

    const appField = ctx.client.utils.string.keyValueField({
      [t.appField.cliVer]: pkg.version,
      [t.appField.cliUp]: clientUptime,
      [t.appField.cmdCount]: `${ctx.client.commands.values.length}`,
      [t.appField.srvCount]: `${guilds.length}`,
      [t.appField.usrCount]: `${userCount}`,
      [t.appField.usrOnSrvRatio]: `${(userCount / guilds.length).toFixed(0)}`
    }, 25);

    // Create embed
    const embed = new Embed()
      .setColor(10800862)
      .setAuthor({ name: t.author, iconUrl: ctx.client.me!.avatarURL() })
      .setDescription(description)
      .setFooter({ text: t.footer })
      .addFields([
        { name: t.system, value: techField, inline: true },
        { name: t.app, value: appField, inline: true }
      ])
      .setTimestamp();

    // Send response
    await ctx.editOrReply({ embeds: [embed] });
  }
}
