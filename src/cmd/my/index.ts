import Command from "@struct/handlers/Command";
import Ping from "./ping";
import Rights from "./rights";
import Vote from "./vote";
import Info from "./info";
import Fault from "./fault";
import Stats from "./stats";
import Invite from "./invite";

export default class My extends Command {
  constructor() {
    super({
      name: 'my',
      description: 'user-specific commands and settings',
      cooldown: 0,
      subcommands: [
        new Ping,
        new Rights,
        new Vote,
        new Info,
        new Fault,
        new Stats,
        new Invite
      ],
    })
  };
}