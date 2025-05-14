import Command from "@struct/handlers/Command";
import Toggle from "./toggle";
import Status from "./status";
import Customize from "./customize";

export default class Verify extends Command {
  constructor() {
    super({
      name: 'verify',
      description: 'manage the verification system for this server',
      cooldown: 0,
      subcommands: [
        new Toggle,
        new Status,
        new Customize
      ],
    })
  };
}