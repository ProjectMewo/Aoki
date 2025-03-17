import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  AttachmentBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder 
} from "discord.js";

export default class Profile extends Subcommand {
  private usernameRegex: RegExp;
  private baseUrl: string;
  private api_v1: string;
  
  constructor() {
    super({
      name: 'profile',
      description: 'get osu! profile information',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'username',
          description: 'the osu! username to look up (defaults to your configured username)',
          required: false
        },
        {
          type: 'string',
          name: 'mode',
          description: 'the game mode to look up (defaults to your configured mode)',
          required: false,
          choices: [
            { name: 'osu!standard', value: 'osu' },
            { name: 'osu!taiko', value: 'taiko' },
            { name: 'osu!catch', value: 'fruits' },
            { name: 'osu!mania', value: 'mania' }
          ]
        }
      ]
    });
    
    this.usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
    this.baseUrl = "https://osu.ppy.sh";
    this.api_v1 = `${this.baseUrl}/api`;
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    const settings = i.user.settings;
    const user = i.options.getString("username") || settings.inGameName;
    const mode = i.options.getString("mode") || i.client.utils.osu.stringModeFormat(settings.defaultMode);

    // handle exceptions
    if (!user || !mode) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: "You didn't configure your in-game info, baka. I don't know you.\n\nConfigure them with `/osu set` so I can store it."
      });
    }
    
    if (!this.usernameRegex.test(user)) {
      return AokiError.USER_INPUT({
        sender: i,
        content: "Baka, the username is invalid."
      });
    }
    
    let profile = await this.findUserByUsername(i, user, mode);
    if (!profile?.username) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: "Baka, that user doesn't exist."
      });
    }

    // Process profile data
    profile = {
      userId: profile.user_id,
      username: profile.username,
      mode: mode,
      properMode: mode == "osu" ? "" : mode,
      level: (+Number(profile.level).toFixed(2)).toString().split("."),
      playTime: Math.floor(Number(profile.total_seconds_played) / 3600),
      playCount: Number(profile.playcount).toLocaleString(),
      pp: (+Number(profile.pp_raw).toFixed(2)).toLocaleString(),
      rank: Number(profile.pp_rank).toLocaleString(),
      accuracy: Number(profile.accuracy).toFixed(2),
      country: profile.country,
      countryRank: Number(profile.pp_country_rank).toLocaleString(),
      ssh: profile.count_rank_ssh,
      ss: profile.count_rank_ss,
      sh: profile.count_rank_sh,
      s: profile.count_rank_s,
      a: profile.count_rank_a,
    };

    // Get profile image
    const url = [
      `https://lemmmy.pw/osusig/sig.php?`,
      `colour=pink&`,
      `uname=${profile.username}&`,
      `mode=${i.client.utils.osu.numberModeFormat(mode)}&`,
      `pp=0`
    ].join("");
    
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(new Uint8Array(buffer));
    const image = new AttachmentBuilder(imageBuffer, { name: "profile.png" });
    
    // Prepare grades display
    const grades = [];
    const rankEmotes = i.client.utils.osu.rankEmotes;
    grades.push(`${rankEmotes.XH}\`${Number(profile.ssh)}\``);
    grades.push(`${rankEmotes.X}\`${Number(profile.ss)}\``);
    grades.push(`${rankEmotes.SH}\`${Number(profile.sh)}\``);
    grades.push(`${rankEmotes.S}\`${Number(profile.s)}\``);
    grades.push(`${rankEmotes.A}\`${Number(profile.a)}\``);
    
    const combinedGrades = grades.join('');
    const playTime = `${profile.playTime} hrs`;
    const level = `${profile.level[1]}% of level ${profile.level[0]}`;

    // Create embed
    const author = {
      name: `osu!${profile.properMode} profile for ${profile.username}`,
      iconURL: `https://flagsapi.com/${profile.country}/flat/64.png`,
      url: `${this.baseUrl}/u/${profile.userId}`
    };
    
    const description = [
      `**▸ Bancho Rank:** #${profile.rank} (${profile.country}#${profile.countryRank})`,
      `**▸ Level:** ${level}`,
      `**▸ PP:** ${profile.pp} **▸ Acc:** ${profile.accuracy}%`,
      `**▸ Playcount:** ${profile.playCount} (${playTime})`,
      `**▸ Ranks:** ${combinedGrades}`,
      `**▸ Profile image:** (from [lemmmy.pw](https://lemmmy.pw))`
    ].join("\n");
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor(author)
      .setDescription(description)
      .setImage("attachment://profile.png")
      .setFooter({
        text: "Ooh",
        iconURL: i.client.user!.displayAvatarURL()
      })
      .setTimestamp();

    await i.editReply({ embeds: [embed], files: [image] });
  }
  
  async findUserByUsername(i: ChatInputCommandInteraction, username: string, mode: string) {
    return (await fetch([
      `${this.api_v1}/get_user?`,
      `k=${process.env["OSU_KEY"]!}&`,
      `u=${username}&`,
      `m=${i.client.utils.osu.numberModeFormat(mode)}`
    ].join(""))
    .then(async res => await res.json()))[0];
  }
}