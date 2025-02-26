import { Schedule } from "../assets/graphql.js";
import { EmbedBuilder } from "discord.js";

export default class AniSchedule {
  constructor(client) {
    this.client = client;
    const { mediaFormat, months, mediaGenres, langflags } = client.util;
    this.info = { mediaFormat, months, defaultgenres: mediaGenres, langflags };
    this.schedule = Schedule;
  }

  async fetch(query, variables) {
    return this.client.util.anilist(query, variables);
  }

  // Re-initialize the schedule after 90 seconds
  reInit() {
    setTimeout(() => this.init(), 90000);
  }

  async init() {
    let schedules;
    try {
      // for mongoose, this would be await this.client.settings.schedules.find({}).lean().exec();
      schedules = await this.client.db`SELECT * FROM schedules;`
    } catch {
      schedules = [];
    }
    if (!schedules?.length) return;

    // Gather unique IDs and episodes from schedules
    const watched = [...new Set(schedules.map(s => s.anilistid))];
    const episode = [...new Set(schedules.map(s => s.nextep))];
    const page = 0;

    const { data } = await this.fetch(this.schedule, { page, watched, episode });
    if (!data) {
      this.client.util.warn('No data found for schedules.', '[AniSchedule]');
      return;
    }

    // Loop through each schedule entry
    for (const schedule of schedules) {
      const entry = data.Page?.airingSchedules.find(
        ({ episode, media }) =>
          episode === schedule.nextep && media.id === schedule.anilistid
      );
      if (!entry) continue;

      const date = new Date(entry.airingAt * 1000);
      const embed = this._makeAnnouncementEmbed(entry, date);
      try {
        const user = await this.client.users.fetch(schedule.id);
        await user.send({ embeds: [embed] });
        await user.setSchedule({ nextep: schedule.nextep + 1 });
      } catch (error) {
        this.client.util.warn(
          `Failed to notify user ${schedule.id}: ${error.message}`,
          '[AniSchedule]'
        );
      }
    }
    this.reInit();
  }

  _makeAnnouncementEmbed(entry, date) {
    const sites = ['Amazon', 'Animelab', 'AnimeLab', 'Crunchyroll', 'Funimation', 'Hidive', 'Hulu', 'Netflix', 'Viz'];
    // Create links for preferred streaming sites
    const watch = entry.media.externalLinks
      ?.filter(link => sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`)
      .join(' • ') || null;

    // Create links for other streaming sites
    const visit = entry.media.externalLinks
      ?.filter(link => !sites.includes(link.site))
      .map(link => `[${link.site}](${link.url})`)
      .join(' • ') || null;

    // Select a random reminder message
    const pick = this.client.util.random([
      'Not like I wanted to remind you or something.',
      'Sensei made me DM you. I didn\'t want to do that.',
      'Alright, me back to my routine.',
      'Whether you knew this or not is irrelevant. It is my job.',
      'Also, have you seen my sensei?',
      'Didn\'t expect to meet me, did you.'
    ]);

    // Build the announcement description
    const description = [
      `You baka, episode **${entry.episode}** of **[${entry.media.title.romaji}](${entry.media.siteUrl})**`,
      entry.media.episodes === entry.episode ? ' **(it\'s the final episode)** ' : ' ',
      `is up. ${pick}${watch ? `\n\nWatch: ${watch}` : '\n\nWatch: *None yet*'}${visit ? `\n\nVisit: ${visit}` : '\n\nVisit: *None yet*'}`,
      '\n\nIt may take some time to appear on the above service(s).'
    ].join('');

    // Build the footer with available media information
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
