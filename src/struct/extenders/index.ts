import { 
  User, Guild, 
  SubCommand, 
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Message,
  ButtonInteraction,
  Command
} from 'seyfert';
const _defProp = Object.defineProperties;

import * as AokiEntities from './Entities';
_defProp(Guild.prototype, {
  settings: { get: AokiEntities.guildSettings },
  update: { value: AokiEntities.guildUpdate }
});
_defProp(User.prototype, {
  settings: { get: AokiEntities.userSettings },
  dev: { get: AokiEntities.userDev },
  voted: { value: AokiEntities.userVoted },
  getSchedule: { value: AokiEntities.userGetSchedule },
  setSchedule: { value: AokiEntities.userSetSchedule },
  update: { value: AokiEntities.userUpdate }
});

import * as AokiSubCommand from './Command';
_defProp(SubCommand.prototype, {
  respondWithLocalizedChoices: { value: AokiSubCommand.respondWithLocalizedChoices }
});
// unused but needed to satisfy types
_defProp(Command.prototype, {
  respondWithLocalizedChoices: { value: AokiSubCommand.respondWithLocalizedChoices }
})

import * as AokiInteractions from './Interactions';
_defProp(AutocompleteInteraction.prototype, {
  t: { get: AokiInteractions.tAutocomplete }
});
_defProp(ButtonInteraction.prototype, {
  t: { get: AokiInteractions.tButton }
});
_defProp(ChatInputCommandInteraction.prototype, {
  t: { get: AokiInteractions.tChatInput }
});
_defProp(Message.prototype, {
  t: { get: AokiInteractions.tMessage }
});
