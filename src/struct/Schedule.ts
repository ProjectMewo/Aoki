import { Schedule } from "../assets/graphql";
import { EmbedBuilder } from "discord.js";
import AokiClient from "./Client";

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

  constructor(client: AokiClient) {
    this.client = client;
    const { mediaFormat, months, mediaGenres, langflags } = client.util;
    this.info = { mediaFormat, months, defaultgenres: mediaGenres, langflags };
    this.schedule = Schedule;
  }

  public async fetch<T>(query: string, variables: object): Promise<T> {
    return this.client.util.anilist(query, variables) as Promise<T>;
  }

  private reInit(): void {
    setTimeout(() => this.init(), 90000);
  }

  public async init(): Promise<void> {
    let schedules: ScheduleEntry[];
    try {
      if (!this.client.db) return;
      schedules = await this.client.db!`SELECT * FROM schedules;`;
    } catch {
      schedules = [];
    }
    if (!schedules?.length) return;

    const watched = Array.from(new Set(schedules.map(s => Number(s.anilistid))));
    const episode = Array.from(new Set(schedules.map(s => Number(s.nextep))));
    const { data } = await this.fetch<{ data: { Page?: { airingSchedules: AiringSchedule[] } } }>(this.schedule, { page: 0, watched, episode });

    if (!data) {
      this.client.util.warn('No data found for schedules.', '[AniSchedule]');
      return;
    }

    for (const schedule of schedules) {
      const entry = data.Page?.airingSchedules.find(
        ({ episode, media }) => episode === Number(schedule.nextep) && media.id === Number(schedule.anilistid)
      );
      if (!entry) continue;

      try {
        const user = await this.client.users.fetch(schedule.id);
        await user.send({ embeds: [this._makeAnnouncementEmbed(entry, new Date(entry.airingAt * 1000))] });
        await (user as any).setSchedule({ nextep: Number(schedule.nextep) + 1 });
      } catch (error: any) {
        this.client.util.warn(`Failed to notify user ${schedule.id}: ${error.message}`, '[AniSchedule]');
      }
    }
    this.reInit();
  }

  private _makeAnnouncementEmbed(entry: AiringSchedule, date: Date): EmbedBuilder {
    const sites = ['Amazon', 'Animelab', 'AnimeLab', 'Crunchyroll', 'Funimation', 'Hidive', 'Hulu', 'Netflix', 'Viz'];
    const watch = entry.media.externalLinks?.filter(link => sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`).join(' • ') || null;
    const visit = entry.media.externalLinks?.filter(link => !sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`).join(' • ') || null;

    const description = [
      `You baka, episode **${entry.episode}** of **[${entry.media.title.romaji}](${entry.media.siteUrl})**`,
      entry.media.episodes === entry.episode ? ' **(it\'s the final episode)** ' : ' ',
      `is up. ${this.client.util.random([
        'Not like I wanted to remind you or something.',
        'Sensei made me DM you. I didn\'t want to do that.',
        'Alright, me back to my routine.',
        'Whether you knew this or not is irrelevant. It is my job.',
        'Also, have you seen my sensei?',
        'Didn\'t expect to meet me, did you.'
      ])}${watch ? `\n\nWatch: ${watch}` : '\n\nWatch: *None yet*'}${visit ? `\n\nVisit: ${visit}` : '\n\nVisit: *None yet*'}`,
      '\n\nIt may take some time to appear on the above service(s).'
    ].join('');

    const footerText = [
      entry.media.format ? `Format: ${this.info.mediaFormat[entry.media.format] || 'Unknown'}` : null,
      entry.media.duration ? `Duration: ${entry.media.duration} minutes` : null,
      entry.media.studios.edges.length ? `Studio: ${entry.media.studios.edges[0].node.name}` : null
    ].filter(Boolean).join('  •  ');

    return new EmbedBuilder()
      .setColor(10800862)
      .setThumbnail(entry.media.coverImage.large)
      .setTitle('AniSchedule')
      .setTimestamp(date)
      .setDescription(description)
      .setFooter({ text: footerText });
  }
}
