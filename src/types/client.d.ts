import { Collection, Client, EmbedBuilder } from 'discord.js';
import { Db } from 'mongodb';
import Command from '../struct/handlers/Command';
import Event from '../struct/handlers/Event';
import Schedule from '../struct/Schedule';
import Settings from '../struct/Settings';
import DBL from '../struct/DBL';
import AnilistUtil from '../struct/utils/AniList';
import ArrayUtil from '../struct/utils/Array';
import LogUtil from '../struct/utils/Logger';
import OsuUtil from '../struct/utils/OsuGame';
import ProfaneUtil from '../struct/utils/Profane';
import TextUtil from '../struct/utils/String';
import TimeUtil from '../struct/utils/Time';
import MiscUtil from '../struct/utils/Misc';

// Module augmentation for default Discord client
declare module 'discord.js' {
  interface Client {
    dev: boolean;
    config: typeof import('../config').default;
    commands: Collection<string, Command>;
    events: Collection<string, Event>;
    schedule: Schedule;
    statsCache: Collection<string, { embed: EmbedBuilder, timestamp: number }>;
    lastGuildCount: number | null;
    osuV2Token: {
      access_token: string | null,
      expires_at: number | null
    };
    db: Db | null;
    settings: {
      users: Settings;
      guilds: Settings;
      schedules: Settings;
      verifications: Settings;
    };
    utils: {
      anilist: AnilistUtil;
      array: ArrayUtil;
      logger: LogUtil;
      osu: OsuUtil;
      profane: ProfaneUtil;
      string: TextUtil;
      time: TimeUtil;
      misc: MiscUtil;
      dbl: DBL;
    };
    ready: boolean;
  }
}