import { User } from 'discord.js';
import AokiClient from '../Client';
import { UserSettings, ScheduleData } from '@local-types/settings';
import defSchemaSettings from '../../assets/schema';

/**
 * Get a global user's settings
 */
const settings = function(this: User & { client: AokiClient }): UserSettings {
  const stored = this.client.settings.users.get(this.id) as Partial<UserSettings> | undefined;
  if (stored && Object.keys(stored).length > 0) {
    return stored as UserSettings;
  }
  const defaultSettings: UserSettings = defSchemaSettings.users;
  return defaultSettings;
};

/**
 * Check if this user is the bot owner
 */
const owner = function(this: User & { client: AokiClient }): boolean {
  return Array.isArray(this.client.config.owners) 
    ? this.client.config.owners.includes(this.id)
    : this.id === this.client.config.owners;
};

/**
 * Check if this user has voted today
 */
const voted = async function(this: User & { client: AokiClient }): Promise<boolean> {
  const userId = this.id;
  return fetch(`https://top.gg/api/bots/${this.client.user.id}/check`, {
    headers: { 
      Authorization: process.env.DBL_TOKEN as string,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })
  .then(res => res.json())
  .then(({ voted }) => Boolean(voted));
};

/**
 * Check whether this user has already set up AniSchedule
 */
const getSchedule = function(this: User & { client: AokiClient }): Partial<ScheduleData> {
  return this.client.settings.schedules.findOne({ id: this.id }) as Partial<ScheduleData>;
};

/**
 * Set schedule data for this user
 */
const setSchedule = function(this: User & { client: AokiClient }, data: Partial<ScheduleData>): Promise<ScheduleData> {
  return this.client.settings.schedules.update(this.id, data) as Promise<ScheduleData>;
};

/**
 * Update a user's settings
 */
const update = function(this: User & { client: AokiClient }, data: Partial<UserSettings>): Promise<UserSettings> {
  return this.client.settings.users.update(this.id, data) as Promise<UserSettings>;
};

// Module augmentation for discord.js to extend User
declare module "discord.js" {
  interface User {
    settings: UserSettings;
    owner(): boolean;
    update(data: Partial<UserSettings>): Promise<UserSettings>;
    voted(): Promise<boolean>;
    getSchedule(): Promise<ScheduleData | null>;
    setSchedule(data: Partial<ScheduleData>): Promise<ScheduleData>;
  }
}

export {
  settings,
  owner,
  update,
  voted, 
  getSchedule,
  setSchedule
};