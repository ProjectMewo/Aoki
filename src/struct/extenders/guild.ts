import { Guild } from 'discord.js';
import AokiClient from '../Client';

export interface GuildSettings {
  timestampchannel: string,
  verificationroleid: string,
  verificationstatus: boolean,
  verificationchannelid: string,
  verificationmessageid: string,
  verificationtitle: string,
  verificationdescription: string,
  verificationthumbnail: string,
  verificationcolor: string
}

/**
 * Get a guild's settings
 * @returns The guild's settings
 */
const settings = function(this: Guild & { client: AokiClient }): GuildSettings {
  const stored = this.client.settings.guilds.get(this.id) as Partial<GuildSettings> | undefined;
  if (stored && Object.keys(stored).length > 0) {
    return stored as GuildSettings;
  }
  const defaultSettings: GuildSettings = {
    timestampchannel: "",
    verificationroleid: "",
    verificationstatus: false,
    verificationchannelid: "",
    verificationmessageid: "",
    verificationtitle: "",
    verificationdescription: "",
    verificationthumbnail: "",
    verificationcolor: ""
  };
  return defaultSettings;
};

/**
 * Update a guild's settings
 * @param obj The object of database entries to update
 * @returns The updated settings
 */
const update = function(this: Guild & { client: AokiClient }, obj: Partial<GuildSettings>): Promise<GuildSettings> {
  return this.client.settings.guilds.update(this.id, obj) as Promise<GuildSettings>;
};

// Module augmentation for discord.js to extend Guild
declare module "discord.js" {
  interface Guild {
    settings: GuildSettings;
    update(data: Partial<GuildSettings>): Promise<GuildSettings>;
  }
}

export {
  settings,
  update
};