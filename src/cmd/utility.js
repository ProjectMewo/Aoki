import Command from '../struct/handlers/Command.js';
import { EmbedBuilder } from "@discordjs/builders";
import { util } from "../assets/import.js";
import { AttachmentBuilder } from 'discord.js';

export default new class Utility extends Command {
  constructor() {
    super({
      data: util,
      permissions: [],
      cooldown: 0
    });
    this.imgur = "https://i.imgur.com/";
    this.headers = {
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
    };
  };
  // avatar command
  async avatar(i) {
    const user = i.options.getUser("user") || i.user;
    // handle different sizes
    const avatar = (s) => user.avatarURL({
      extension: "png",
      dynamic: true,
      size: s
    });
    const description = [
      `Quality: `,
      `[x128](${avatar(128)}) | `,
      `[x256](${avatar(256)}) | `,
      `[x512](${avatar(512)}) | `,
      `[x1024](${avatar(1024)}) | `,
      `[x2048](${avatar(2048)})`
    ].join("");
    const embed = this.embed
      .setAuthor({ name: `${user.username}'s Avatar` })
      .setDescription(description)
      .setImage(avatar(2048));
    await i.editReply({ embeds: [embed] });
  };
  // banner command
  async banner(i) {
    const user = i.options.getUser("user") || i.user;
    // force fetch user
    const { banner } = await user.fetch();
    if (!banner) return this.throw(i, "Baka, this user has no banner.");
    // handle different sizes
    const bannerURL = (s) => user.bannerURL({
      extension: "png",
      dynamic: true,
      size: s
    });
    const description = [
      `Quality: `,
      `[x128](${bannerURL(128)}) | `,
      `[x256](${bannerURL(256)}) | `,
      `[x512](${bannerURL(512)}) | `,
      `[x1024](${bannerURL(1024)}) | `,
      `[x2048](${bannerURL(2048)})`
    ].join("");
    const embed = this.embed
      .setAuthor({ name: `${user.username}'s Banner` })
      .setDescription(description)
      .setImage(bannerURL(2048));
    await i.editReply({ embeds: [embed] });
  };
  // channel command
  async channel(i, _, util) {
    const channel = i.options.getChannel("channel") || i.channel;
    // utilities
    const channelTypes = {
      0: { icon: `${this.imgur}IkQqhRj.png`, type: "Text Channel" },
      2: { icon: `${this.imgur}VuuMCXq.png`, type: "Voice Channel" },
      4: { icon: `${this.imgur}Ri5YA3G.png`, type: "Guild Category" },
      5: { icon: `${this.imgur}4TKO7k6.png`, type: "News Channel" },
      10: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      11: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      12: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      13: { icon: `${this.imgur}F92hbg9.png`, type: "Stage Channel" },
      14: { icon: `${this.imgur}Dfu73ox.png`, type: "Guild Directory" },
      15: { icon: `${this.imgur}q13YoYu.png`, type: "Guild Forum" },
    };
    const { icon, type } = channelTypes[channel.type] || {};
    const createdAt = new Date(channel.createdAt);
    const time = util.formatDistance(createdAt, new Date(), { addSuffix: true });
    const authorFieldName = `${channel.name}${channel.name.endsWith("s") ? "'" : "'s"} Information`;
    const field = util.keyValueField({
      "Position": channel.position || "Unknown",
      "Type": type,
      "Created": time,
      "NSFW?": channel.nsfw ? "Yes" : "No",
      "Slowmode": channel.slowmode || "None",
      "ID": channel.id,
      "Topic": channel.topic
    }, 30);
    // make embed
    const embed = this.embed
      .setAuthor({ name: authorFieldName })
      .setThumbnail(icon)
      .addFields([{ name: "\u2000", value: field }]);
    await i.editReply({ embeds: [embed] });
  };
  // server command
  async server(i, _, util) {
    const guild = i.guild;
    const owner = await i.client.users.fetch(guild.ownerId);
    const icon = guild.iconURL({ dynamic: true, size: 1024 }) || "https://i.imgur.com/AWGDmiu.png";
    // shortcuts
    const since = util.formatDate(new Date(guild.createdAt), 'MMMM yyyy');
    const channelTypeCount = (type) => guild.channels.cache.filter(channel => channel.type == type).size;
    const text = channelTypeCount(0);
    const voice = channelTypeCount(2);
    const category = channelTypeCount(4);
    const news = channelTypeCount(5);
    const generalInfoField = util.keyValueField({
      "Owner": util.textTruncate(owner.username, 20),
      "Role Count": i.guild.roles.cache.size,
      "Emoji Count": i.guild.emojis.cache.size,
      "Created": since,
      "Boosts": guild.premiumSubscriptionCount,
      "Main Locale": guild.preferredLocale,
      "Verification": guild.verificationLevel,
      "Filter": guild.explicitContentFilter
    }, 30);
    const channelInfoField = util.keyValueField({
      "Categories": category,
      "Text Channels": text,
      "Voice Channels": voice,
      "News Channels": news,
      "AFK Channel": guild.afkChannel?.name || "None"
    }, 30);
    const description = `*${guild.description == null ? "Server has no description." : guild.description}*\n\n`;
    // make embed
    const embed = this.embed
      .setAuthor({ name: `${guild.name}`, iconURL: icon })
      .setDescription(description)
      .addFields([
        { name: "General Info", value: generalInfoField },
        { name: "Channels Info", value: channelInfoField }
      ]);
    await i.editReply({ embeds: [embed] });
  };
  // github command
  async github(i, _, util) {
    const user = i.options.getString("user");
    const repo = i.options.getString("repo");
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: this.headers }).then(res => res.json());
    if (!res?.id) return this.throw(i, "Baka, that repo doesn't exist.");
    // utilities
    const formatBytes = (bytes) => {
      if (bytes == 0) return '0B';
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', "PB", 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))}${sizes[i]}`
    };
    const icon = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    const size = formatBytes(res.size);
    const license = repo.license?.name || "Unknown";
    const field = util.keyValueField({
      "Language": res.language || "Unknown",
      "Forks": res.forks_count.toLocaleString(),
      "License": license,
      "Open Issues": res.open_issues.toLocaleString(),
      "Watchers": res.subscribers_count.toLocaleString(),
      "Stars": res.stargazers_count.toLocaleString(),
      "Size": size,
      "Archived?": res.archived ? "Yes" : "No",
      "Disabled?": res.disabled ? "Yes" : "No",
      "Forked?": res.fork ? "Yes" : "No"
    }, 30);
    // make embed
    const embed = this.embed
      .setAuthor({ name: "GitHub", iconURL: icon })
      .setTitle(`${user}/${repo}`)
      .setURL(res.html_url)
      .setThumbnail(res.owner.avatar_url)
      .setDescription(`${res.description}\n\n`)
      .addFields([{ name: "\u2000", value: field }]);
    await i.editReply({ embeds: [embed] });
  };
  // npm command
  async npm(i, query, util) {
    const raw = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=1`, { headers: this.headers }).then(res => res.json());
    const res = raw.objects?.[0]?.package;
    if (!res) return this.throw(i, "Baka, that's an invalid repository. Or did you make a typo?");
    // utilities
    const score = raw.objects[0].score;
    const maintainers = res.maintainers.map(maintainer => `\`${maintainer.username}\``).join(', ');
    const keywords = res.keywords?.map(keyword => `\`${keyword}\``).join(', ') || "None";
    const description = [
      `${util.textTruncate(res.description, 75)}\n\n`,
      `**Keywords:** ${keywords}\n`,
      `**Maintainers:** ${maintainers}`
    ].join("");
    const field = util.keyValueField({
      "Version": res.version || "Unknown",
      "Author": res.publisher.username,
      "Modified": util.formatDate(new Date(res.date), 'dd MMMM yyyy'),
      "Score": (score.final * 100).toFixed(1)
    }, 40);
    // make embed
    const embed = this.embed
      .setAuthor({ name: "npm Registry", iconURL: 'https://i.imgur.com/24yrZxG.png' })
      .setTitle(`${res.name}`)
      .setURL(`https://www.npmjs.com/package/${res.name}`)
      .setDescription(description)
      .addFields([{ name: "\u2000", value: field }]);
    await i.editReply({ embeds: [embed] });
  };
  // urban command
  async urban(i, query, util) {
    // handle user query
    if (await util.isProfane(query) && !i.channel.nsfw) return this.throw(i, "Your query has some profanity in there.\n\nEither get into a NSFW channel, or change your query.");
    const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${query}`, { headers: this.headers }).then(res => res.json());
    if (!res?.list?.length) return this.throw(i, "Hmph, seems like there's no definition for that. Even on Urban Dictionary.\n\nYou know what that means.")
    const definition = res.list[0];
    // utilities
    const nsfw = i.channel.nsfw;
    const truncateText = (text, maxLength) => util.textTruncate(nsfw ? text : util.cleanProfane(text), maxLength);
    const fields = {
      definition: '```fix\n' + truncateText(definition.definition, 1000) + '\n```',
      example: '```fix\n' + truncateText(definition.example || 'N/A', 1000) + '\n```',
      author: '```fix\n' + truncateText(definition.author || 'N/A', 250) + '\n```'
    };
    // make embed
    const embed = this.embed
      .setTitle(`Definition of ${definition.word}`)
      .setURL(definition.urbanURL)
      .addFields([
        { name: '...is', value: fields.definition },
        { name: 'Examples', value: fields.example },
        { name: 'Submitted by', value: fields.author },
        { name: 'Profane Word?', value: 'Yell at my sensei through `/my fault`, the patch should be added in a few working days.' }
      ]);
    await i.editReply({ embeds: [embed] });
  };
  // screenshot command
  async screenshot(i, query, util) {
    // handle user query
    const url = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    if (!query.match(url)) return this.throw(i, "Baka, that's not a valid URL.\n\nMake sure it starts with either `https://` or `http://`.");
    const nsfwPages = await util.getStatic("nsfw");
    if (nsfwPages.domains.includes(query) && !i.channel.nsfw) return this.throw(i, "That's a NSFW page, you moron!");
    // take screenshot
    try {
      const url = [
        `https://api.screenshotone.com/take?`,
        `access_key=${process.env.SCREENSHOT_KEY}&`,
        `url=${query}&`,
        `format=jpg&`,
        `block_ads=true&`,
        `block_cookie_banners=true&`,
        `block_trackers=true&`,
        `timeout=10`
      ].join("");
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(new Uint8Array(buffer));
      const image = new AttachmentBuilder().setFile(imageBuffer).setName("image.png");
      const embed = this.embed.setImage("attachment://image.png");
      await i.editReply({ embeds: [embed], files: [image] });
    } catch {
      return this.throw(i, "Something's wrong with that URL.\n\nCheck if you made a typo.");
    };
  };
  // wiki command
  async wiki(i, query, util) {
    // handle exceptions
    if (await util.isProfane(query) && !i.channel.nsfw) return this.throw(i, "Your query has something to do with profanity, baka.\n\nEither move to a NSFW channel, or change the query.");
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`).then(async res => await res.json());
    if (!res?.title) return this.throw(i, "Can't find that. Check your query.");
    // utilities
    const timestamp = new Date(res.timestamp);
    const thumbnail = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png";
    const description = [
      `***Description:** ${res.description || "None"}*\n\n`,
      `**Extract:** ${util.textTruncate(res.extract, 1000).split(". ").join(".\n- ")}`
    ].join("");
    // make embed
    const embed = this.embed
      .setTimestamp(timestamp)
      .setTitle(res.title)
      .setThumbnail(thumbnail)
      .setURL(res.content_urls.desktop.page)
      .setDescription(description);
    await i.editReply({ embeds: [embed] });
  };
  // internal utilities
  get embed() {
    return new EmbedBuilder()
      .setColor(10800862)
      .setFooter({ text: `Requested by ${this.i.user.username}`, iconURL: this.i.user.displayAvatarURL() })
      .setTimestamp();
  };
}