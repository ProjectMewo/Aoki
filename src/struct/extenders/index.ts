import { User, Guild } from 'discord.js';
const _defProp = Object.defineProperties;

import * as AokiUser from './user';
_defProp(User.prototype, {
  settings: { get: AokiUser.settings },
  owner: { get: AokiUser.owner },
  voted: { get: AokiUser.voted },
  getSchedule: { value: AokiUser.getSchedule },
  setSchedule: { value: AokiUser.setSchedule },
  update: { value: AokiUser.update }
});

import * as AokiGuild from "./guild";
_defProp(Guild.prototype, {
  settings: { get: AokiGuild.settings },
  update: { value: AokiGuild.update }
});