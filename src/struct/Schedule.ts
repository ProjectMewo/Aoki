import { Schedule } from "@assets/graphql";
import { DefaultLocale, Embed, User } from "seyfert";
import AokiClient from "@struct/Client";
import AnilistUtil from "@utils/AniList";

interface ScheduleEntry {
  id: string;
  anilistid: string;
  nextep: string;
}

interface Media {
  id: number;
  title: { romaji: string };
  siteUrl: string;
  episodes: number;
  format: string;
  duration: number;
  coverImage: { large: string };
  externalLinks: Array<{ site: string, url: string }>;
  studios: { edges: Array<{ node: { name: string } }> };
}

interface AiringSchedule {
  episode: number;
  airingAt: number;
  media: Media;
}

export default class AniSchedule {
  private client: AokiClient;
  private info: {
    mediaFormat: { [key: string]: string };
    months: string[];
    defaultgenres: string[];
    langflags: Array<{ lang: string, flag: string }>;
  };
  private schedule: typeof Schedule;
  private anilistUtil: AnilistUtil;

  constructor(client: AokiClient) {
    this.client = client;
    this.anilistUtil = new AnilistUtil(client);
    this.info = { 
      mediaFormat: this.anilistUtil.mediaFormat, 
      months: this.anilistUtil.months, 
      defaultgenres: this.anilistUtil.mediaGenres, 
      langflags: this.anilistUtil.langflags
    };
    this.schedule = Schedule;
  }

  public async fetch<T>(query: string, variables: object): Promise<T> {
    return this.anilistUtil.fetch(query, variables) as Promise<T>;
  }

  private t(user: User): DefaultLocale {
    return this.client.t(this.client.langs.defaultLang ?? 'en-US').get(user.settings.language || 'en-US');
  };

  private reInit(): void {
    setTimeout(() => this.init(), 90000);
  }

  public async init(): Promise<void> {
    let schedules: ScheduleEntry[];
    try {
      if (!this.client.db) return;
      schedules = await this.client.db.collection("schedules").find({}).toArray()
        .then(docs => docs.map(doc => ({
          id: doc.id,
          anilistid: doc.anilistid,
          nextep: doc.nextep
        } as ScheduleEntry))).catch(() => []);
    } catch {
      schedules = [];
    }
    if (!schedules?.length) return;

    const watched = Array.from(new Set(schedules.map(s => Number(s.anilistid))));
    const episode = Array.from(new Set(schedules.map(s => Number(s.nextep))));
    const data = await this.fetch<{ Page?: { airingSchedules: AiringSchedule[] } }>(this.schedule, { page: 0, watched, episode });

    if (!data) {
      this.client.logger.warn('No data found for schedules.');
      return;
    }

    for (const schedule of schedules) {
      const entry = data.Page?.airingSchedules.find(
        ({ episode, media }) => episode === Number(schedule.nextep) && media.id === Number(schedule.anilistid)
      );
      if (!entry) continue;

      try {
        const user = await this.client.users.fetch(schedule.id, true);
        const t = this.t(user);
        await this.client.users.write(schedule.id, { embeds: [this._makeAnnouncementEmbed(entry, new Date(entry.airingAt * 1000), t)] });
        await user.setSchedule({ nextEp: Number(schedule.nextep) + 1 });
      } catch (error: any) {
        this.client.logger.warn(`Failed to notify user ${schedule.id}: ${error.message}`);
      }
    }
    this.reInit();
  }

  private _makeAnnouncementEmbed(entry: AiringSchedule, date: Date, t: DefaultLocale): Embed {
    const sites = ['Amazon', 'Animelab', 'AnimeLab', 'Crunchyroll', 'Funimation', 'Hidive', 'Hulu', 'Netflix', 'Viz'];
    const watch = entry.media.externalLinks?.filter(link => sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`).join(' • ') || null;
    const visit = entry.media.externalLinks?.filter(link => !sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`).join(' • ') || null;

    const description = [
      t.aniSchedule.episodeUp(entry.episode, entry.media.title.romaji, entry.media.siteUrl),
      entry.media.episodes === entry.episode ? ` **${t.aniSchedule.finalEpisode}**.` : '.',
      `${this.client.utils.array.random(t.aniSchedule.randomRemarks)}${watch ? `${t.aniSchedule.watch(watch)}` : t.aniSchedule.noWatch}${visit ? `${t.aniSchedule.visit(visit)}` : t.aniSchedule.noVisit}`,
      t.aniSchedule.delayNotice
    ].join('');

    const footerText = [
      entry.media.format ? `${t.aniSchedule.embed.footer.format}${this.info.mediaFormat[entry.media.format] || t.aniSchedule.embed.footer.unknown}` : null,
      entry.media.duration ? `${t.aniSchedule.embed.footer.duration(entry.media.duration)}` : null,
      entry.media.studios.edges.length ? `${t.aniSchedule.embed.footer.studio}${entry.media.studios.edges[0].node.name}` : null
    ].filter(Boolean).join('  •  ');

    return new Embed()
      .setColor(10800862)
      .setThumbnail(entry.media.coverImage.large)
      .setTitle('AniSchedule')
      .setTimestamp(date)
      .setDescription(description)
      .setFooter({ text: footerText });
  }
}
