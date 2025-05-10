import { User, Guild } from 'seyfert';
const _defProp = Object.defineProperties;

import * as AokiUser from './User';
_defProp(User.prototype, {
  settings: { get: AokiUser.settings },
  dev: { get: AokiUser.dev },
  voted: { get: AokiUser.voted },
  getSchedule: { value: AokiUser.getSchedule },
  setSchedule: { value: AokiUser.setSchedule },
  update: { value: AokiUser.update }
});

import * as AokiGuild from "./Guild";
_defProp(Guild.prototype, {
  settings: { get: AokiGuild.settings },
  update: { value: AokiGuild.update }
});