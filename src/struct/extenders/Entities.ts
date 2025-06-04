import { Guild, User } from 'seyfert';
import AokiClient from '../Client';
import { GuildSettings, UserSettings, ScheduleData } from '@local-types/settings';
import defSchemaSettings from '../../assets/schema';

/** Guild-related functions */
const guildSettings = function(this: Guild & { client: AokiClient }): GuildSettings {
  const stored = this.client.settings.guilds.get(this.id) as Partial<GuildSettings> | undefined;
  if (stored && Object.keys(stored).length > 0) {
    return stored as GuildSettings;
  }
  const defaultSettings: GuildSettings = defSchemaSettings.guilds;
  return defaultSettings;
};

const guildUpdate = function(this: Guild & { client: AokiClient }, obj: Partial<GuildSettings>): Promise<GuildSettings> {
  return this.client.settings.guilds.update(this.id, obj) as Promise<GuildSettings>;
};

/** User-related functions */
const userSettings = function(this: User & { client: AokiClient }): UserSettings {
  const stored = this.client.settings.users.get(this.id) as Partial<UserSettings> | undefined;
  if (stored && Object.keys(stored).length > 0) {
    return stored as UserSettings;
  }
  const defaultSettings: UserSettings = defSchemaSettings.users;
  return defaultSettings;
};

const userDev = function(this: User & { client: AokiClient }): boolean {
  const devArray = process.env.DEV_ID!.split(",");
  return devArray.includes(this.id);
};

const userVoted = async function(this: User & { client: AokiClient }): Promise<boolean> {
  const userId = this.id;
  return fetch(`https://top.gg/api/bots/${this.client.me!.id}/check`, {
    headers: {
      Authorization: process.env.DBL_TOKEN as string,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })
  .then(res => res.json())
  .then(({ voted }) => Boolean(voted));
};

const userGetSchedule = function(this: User & { client: AokiClient }): Partial<ScheduleData> {
  return this.client.settings.schedules.findOne({ id: this.id }) as Partial<ScheduleData>;
};

const userSetSchedule = function(this: User & { client: AokiClient }, data: Partial<ScheduleData>): Promise<ScheduleData> {
  return this.client.settings.schedules.update(this.id, data) as Promise<ScheduleData>;
};

const userUpdate = function(this: User & { client: AokiClient }, data: Partial<UserSettings>): Promise<UserSettings> {
  return this.client.settings.users.update(this.id, data) as Promise<UserSettings>;
};

declare module "seyfert" {
  interface Guild {
    settings: GuildSettings;
    update(data: Partial<GuildSettings>): Promise<GuildSettings>;
  }
  interface User {
    settings: UserSettings;
    dev(): boolean;
    update(data: Partial<UserSettings>): Promise<UserSettings>;
    voted(): Promise<boolean>;
    getSchedule(): Promise<ScheduleData | null>;
    setSchedule(data: Partial<ScheduleData>): Promise<ScheduleData>;
  }
}

export {
  guildSettings,
  guildUpdate,
  userSettings,
  userDev,
  userVoted,
  userGetSchedule,
  userSetSchedule,
  userUpdate
};
