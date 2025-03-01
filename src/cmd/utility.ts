import Command from '../struct/handlers/Command';
import { ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder, User, TextChannel } from "discord.js";
import { util } from "../assets/import";

export default new class Utility extends Command {
  public imgur: string;
  public headers: Record<string, string>;
  // store the current interaction to use in embed getter
  private _interaction?: ChatInputCommandInteraction;

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
  }

  // avatar command
  async avatar(i: ChatInputCommandInteraction): Promise<void> {
    this._interaction = i;
    const user: User = i.options.getUser("user") || i.user;
    // handle different sizes
    const avatar = (s: 128 | 256 | 512 | 1024 | 2048) => user.avatarURL({
      extension: "png",
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
  }

  // banner command
  async banner(i: ChatInputCommandInteraction): Promise<void> {
    this._interaction = i;
    const user: User = i.options.getUser("user") || i.user;
    // force fetch user
    const fetched = await user.fetch();
    const banner = fetched.banner;
    if (!banner) return this.throw(i, "Baka, this user has no banner.");
    // handle different sizes
    const bannerURL = (s: 128 | 256 | 512 | 1024 | 2048) => user.bannerURL({
      extension: "png",
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
      .setImage(bannerURL(2048)!);
    await i.editReply({ embeds: [embed] });
  }

  // channel command
  async channel(i: ChatInputCommandInteraction, _: unknown, util: any): Promise<void> {
    this._interaction = i;
    const channel = i.options.getChannel("channel") ?? i.channel;
    if (!channel) return this.throw(i, "Channel not found.");
    // Ensure channel has a name property
    if (!('name' in channel)) return this.throw(i, "Invalid channel type.");
    const ch = channel as { name: string; createdAt: Date | string; position?: number; nsfw?: boolean; slowmode?: number; topic?: string; id: string };
    const channelTypes: { [key: number]: { icon: string; type: string } } = {
      0: { icon: `${this.imgur}IkQqhRj.png`, type: "Text Channel" },
      2: { icon: `${this.imgur}VuuMCXq.png`, type: "Voice Channel" },
      4: { icon: `${this.imgur}Ri5YA3G.png`, type: "Guild Category" },
      5: { icon: `${this.imgur}4TKO7k6.png`, type: "News Channel" },
      10: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      11: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      12: { icon: `${this.imgur}Dfu73ox.png`, type: "Threads Channel" },
      13: { icon: `${this.imgur}F92hbg9.png`, type: "Stage Channel" },
      14: { icon: `${this.imgur}Dfu73ox.png`, type: "Guild Directory" },
      15: { icon: `${this.imgur}q13YoYu.png`, type: "Guild Forum" }
    };
    // channel.type might be unknown, cast to number if safe,
    const key = (channel as any).type as number;
    const { icon, type } = channelTypes[key] || { icon: "", type: "Unknown" };
    const createdAt = new Date((ch.createdAt as string) || Date.now());
    const time = util.formatDistance(createdAt, new Date(), { addSuffix: true });
    const authorFieldName = `${ch.name}${ch.name.endsWith("s") ? "'" : "'s"} Information`;
    const field = util.keyValueField({
      "Position": ch.position || "Unknown",
      "Type": type,
      "Created": time,
      "NSFW?": ch.nsfw ? "Yes" : "No",
      "Slowmode": ch.slowmode || "None",
      "ID": ch.id,
      "Topic": ch.topic
    }, 30);
    const embed = this.embed
      .setAuthor({ name: authorFieldName })
      .setThumbnail(icon)
      .addFields([{ name: "\u2000", value: field }]);
    await i.editReply({ embeds: [embed] });
  }

  // server command
  async server(i: ChatInputCommandInteraction, _: unknown, util: any): Promise<void> {
    this._interaction = i;
    if (!i.guild) return this.throw(i, "Guild not found.");
    const guild = i.guild;
    const owner = await i.client.users.fetch(guild.ownerId);
    const icon = guild.iconURL({ size: 1024 }) || "https://i.imgur.com/AWGDmiu.png";
    // shortcuts
    const since = util.formatDate(new Date(guild.createdAt), 'MMMM yyyy');
    const channelTypeCount = (type: number): number => guild.channels.cache.filter((channel: any) => channel.type === type).size;
    const text = channelTypeCount(0);
    const voice = channelTypeCount(2);
    const category = channelTypeCount(4);
    const news = channelTypeCount(5);
    const generalInfoField = util.keyValueField({
      "Owner": util.textTruncate(owner.username, 20),
      "Role Count": guild.roles.cache.size,
      "Emoji Count": guild.emojis.cache.size,
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
      "AFK Channel": guild.afkChannel ? guild.afkChannel.name : "None"
    }, 30);
    const description = `*${guild.description == null ? "Server has no description." : guild.description}*\n\n`;
    // make embed
    const embed = this.embed
      .setAuthor({ name: guild.name, iconURL: icon })
      .setDescription(description)
      .addFields([
        { name: "General Info", value: generalInfoField },
        { name: "Channels Info", value: channelInfoField }
      ]);
    await i.editReply({ embeds: [embed] });
  }

  // github command
  async github(i: ChatInputCommandInteraction, _: unknown, util: any): Promise<void> {
    this._interaction = i;
    const user = i.options.getString("user") as string;
    const repo = i.options.getString("repo") as string;
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: this.headers }).then(res => res.json());
    if (!res?.id) return this.throw(i, "Baka, that repo doesn't exist.");
    // utilities
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0B';
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB', "PB", 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))}${sizes[i]}`;
    };
    const icon = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    const size = formatBytes(res.size);
    const license = res.license?.name || "Unknown";
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
  }

  // npm command
  async npm(i: ChatInputCommandInteraction, query: string, util: any): Promise<void> {
    this._interaction = i;
    const raw = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=1`, { headers: this.headers }).then(res => res.json());
    const res = raw.objects?.[0]?.package;
    if (!res) return this.throw(i, "Baka, that's an invalid repository. Or did you make a typo?");
    // utilities
    const score = raw.objects[0].score;
    const maintainers = res.maintainers.map((maintainer: any) => `\`${maintainer.username}\``).join(', ');
    const keywords = res.keywords?.map((keyword: any) => `\`${keyword}\``).join(', ') || "None";
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
  }

  // urban command
  async urban(i: ChatInputCommandInteraction, query: string, util: any): Promise<void> {
    this._interaction = i;
    if (await util.isProfane(query) && !(i.channel as TextChannel).nsfw) return this.throw(i, "Your query has some profanity in there.\n\nEither get into a NSFW channel, or change your query.");
    const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${query}`, { headers: this.headers }).then(res => res.json());
    if (!res?.list?.length) return this.throw(i, "Hmph, seems like there's no definition for that. Even on Urban Dictionary.\n\nYou know what that means.");
    const definition = res.list[0];
    const nsfw = (i.channel as TextChannel).nsfw;
    const truncateText = (text: string, maxLength: number): string => util.textTruncate(nsfw ? text : util.cleanProfane(text), maxLength);
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
  }

  // screenshot command
  async screenshot(i: ChatInputCommandInteraction, query: string, util: any): Promise<void> {
    this._interaction = i;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    if (!query.match(urlRegex)) return this.throw(i, "Baka, that's not a valid URL.\n\nMake sure it starts with either `https://` or `http://`.");
    const nsfwPages = await util.getStatic("nsfw");
    if (nsfwPages.domains.includes(query) && !(i.channel as TextChannel).nsfw) return this.throw(i, "That's a NSFW page, you moron!");
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
      const image = new AttachmentBuilder(imageBuffer, { name: "image.png" });
      const embed = this.embed.setImage("attachment://image.png");
      await i.editReply({ embeds: [embed], files: [image] });
    } catch {
      return this.throw(i, "Something's wrong with that URL.\n\nCheck if you made a typo.");
    }
  }

  // wiki command
  async wiki(i: ChatInputCommandInteraction, query: string, util: any): Promise<void> {
    this._interaction = i;
    if (await util.isProfane(query) && !(i.channel as TextChannel).nsfw) return this.throw(i, "Your query has something to do with profanity, baka.\n\nEither move to a NSFW channel, or change the query.");
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`).then(async res => await res.json());
    if (!res?.title) return this.throw(i, "Can't find that. Check your query.");
    const timestamp = new Date(res.timestamp);
    const thumbnail = "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1122px-Wikipedia-logo-v2.svg.png";
    const description = [
      `***Description:** ${res.description || "None"}*\n\n`,
      `**Extract:** ${util.textTruncate(res.extract, 1000).split(". ").join(".\n- ")}`
    ].join("");
    const embed = this.embed
      .setTimestamp(timestamp)
      .setTitle(res.title)
      .setThumbnail(thumbnail)
      .setURL(res.content_urls.desktop.page)
      .setDescription(description);
    await i.editReply({ embeds: [embed] });
  }

  // internal utilities
  get embed(): EmbedBuilder {
    const username = this._interaction?.user.username || "Unknown";
    const avatar = this._interaction?.user.displayAvatarURL() || "";
    return new EmbedBuilder()
      .setColor(10800862)
      .setFooter({ text: `Requested by ${username}`, iconURL: avatar })
      .setTimestamp();
  }
}
