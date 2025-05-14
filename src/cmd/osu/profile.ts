import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  LocalesT,
  Options,
  SubCommand
} from "seyfert";

const options = {
  username: createStringOption({
    description: 'the osu! username to look up (defaults to your configured username)',
    description_localizations: {
      "en-US": 'the osu! username to look up (defaults to your configured username)',
      "vi": 'tên người dùng osu! bạn muốn tra cứu (mặc định là tên đã cấu hình của bạn)'
    },
    required: false
  }),
  mode: createStringOption({
    description: 'the game mode to look up (defaults to your configured mode)',
    description_localizations: {
      "en-US": 'the game mode to look up (defaults to your configured mode)',
      "vi": 'chế độ chơi bạn muốn tra cứu (mặc định là chế độ đã cấu hình của bạn)'
    },
    required: false,
    choices: [
      { name: 'osu!standard', value: 'osu' },
      { name: 'osu!taiko', value: 'taiko' },
      { name: 'osu!catch', value: 'fruits' },
      { name: 'osu!mania', value: 'mania' }
    ]
  })
};

@Declare({
  name: 'profile',
  description: 'get osu! profile information'
})
@LocalesT('osu.profile.name', 'osu.profile.description')
@Options(options)
export default class Profile extends SubCommand {
  private usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
  private baseUrl = "https://osu.ppy.sh";
  private api_v1 = `${this.baseUrl}/api`;

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.profile;
    await ctx.deferReply();

    const settings = ctx.author.settings;
    const user = ctx.options.username || settings.inGameName;
    const mode = ctx.options.mode || ctx.client.utils.osu.stringModeFormat(settings.defaultMode);

    if (!user || !mode) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.notConfigured
      });
    }

    if (!this.usernameRegex.test(user)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidUsername
      });
    }

    let profile = await this.findUserByUsername(ctx, user, mode);
    if (!profile?.username) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.userNotFound
      });
    }

    profile = {
      userId: profile.user_id,
      username: profile.username,
      mode: mode,
      properMode: mode === "osu" ? "" : mode,
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

    const url = [
      `https://lemmmy.pw/osusig/sig.php?`,
      `colour=pink&`,
      `uname=${profile.username}&`,
      `mode=${ctx.client.utils.osu.numberModeFormat(mode)}&`,
      `pp=0`
    ].join("");

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(new Uint8Array(buffer));
    const image = {
      data: imageBuffer,
      filename: "profile.png"
    };

    const grades = [];
    const rankEmotes = ctx.client.utils.osu.rankEmotes;
    grades.push(`${rankEmotes.XH}\`${Number(profile.ssh)}\``);
    grades.push(`${rankEmotes.X}\`${Number(profile.ss)}\``);
    grades.push(`${rankEmotes.SH}\`${Number(profile.sh)}\``);
    grades.push(`${rankEmotes.S}\`${Number(profile.s)}\``);
    grades.push(`${rankEmotes.A}\`${Number(profile.a)}\``);

    const combinedGrades = grades.join('');

    const author = {
      name: t.embed.author(profile.properMode, profile.username),
      iconUrl: `https://flagsapi.com/${profile.country}/flat/64.png`
    };

    const description = t.embed.description(profile, combinedGrades);

    const embed = new Embed()
      .setColor(10800862)
      .setAuthor(author)
      .setURL(`${this.baseUrl}/u/${profile.userId}`)
      .setDescription(description)
      .setImage("attachment://profile.png")
      .setFooter({
        text: t.embed.footer,
        iconUrl: ctx.interaction.user.avatarURL()
      })
      .setTimestamp();

    await ctx.editOrReply({ embeds: [embed], files: [image] });
  }

  async findUserByUsername(ctx: CommandContext<typeof options>, username: string, mode: string) {
    return (await fetch([
      `${this.api_v1}/get_user?`,
      `k=${process.env["OSU_KEY"]!}&`,
      `u=${username}&`,
      `m=${ctx.client.utils.osu.numberModeFormat(mode)}`
    ].join(""))
    .then(async res => await res.json()))[0];
  }
}
