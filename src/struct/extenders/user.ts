import { User } from 'discord.js';
import AokiClient from '../Client';

interface UserSettings {
  ingamename: string,
  defaultmode: number,
  processmessagepermission: boolean
};

interface ScheduleData {
  anilistid: number;
  nextep: number;
}

/**
 * Get a global user's settings
 */
const settings = function(this: User & { client: AokiClient }): UserSettings {
  const stored = this.client.settings.users.get(this.id) as Partial<UserSettings> | undefined;
  if (stored && Object.keys(stored).length > 0) {
    return stored as UserSettings;
  }
  const defaultSettings: UserSettings = {
    ingamename: "",
    defaultmode: 0,
    processmessagepermission: true
  };
  return defaultSettings;
};

/**
 * Check if this user is the bot owner
 */
const owner = function(this: User & { client: AokiClient }): boolean {
  return Array.isArray(this.client.util.owners) 
    ? this.client.util.owners.includes(this.id)
    : this.id === this.client.util.owners;
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
const getSchedule = function(this: User & { client: AokiClient }): object {
  return this.client.settings.schedules.findOne("id", this.id);
};

/**
 * Set schedule data for this user
 */
const setSchedule = function(this: User & { client: AokiClient }, data: ScheduleData): object {
  return this.client.settings.schedules.update(this.id, data);
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
    getSchedule(): Promise<{ anilistid: number, nextep: number } | null>;
    setSchedule(data: { anilistid: number, nextep: number }): Promise<void>;
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