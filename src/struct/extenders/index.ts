import { 
  User, Guild, 
  SubCommand, 
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Message,
  ButtonInteraction
} from 'seyfert';
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

import * as AokiSubCommand from './SubCommand';
_defProp(SubCommand.prototype, {
  respondWithLocalizedChoices: { value: AokiSubCommand.respondWithLocalizedChoices }
});

import * as AokiAutocomplete from './AutocompleteInteraction';
_defProp(AutocompleteInteraction.prototype, {
  t: { get: AokiAutocomplete.t }
});

import * as AokiChatInput from './ChatInputCommandInteraction';
_defProp(ChatInputCommandInteraction.prototype, {
  t: { get: AokiChatInput.t }
});

import * as AokiMessage from './Message';
_defProp(Message.prototype, {
  t: { get: AokiMessage.t }
});

import * as AokiButton from './ButtonInteraction';
_defProp(ButtonInteraction.prototype, {
  t: { get: AokiButton.t }
});
