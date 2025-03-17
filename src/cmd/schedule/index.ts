import Command from "@struct/handlers/Command";
import Add from "./add";
import Remove from "./remove";
import Current from "./current";

export default class Schedule extends Command {
  constructor() {
    super({
      name: 'schedule',
      description: 'manage anime new episode notifications',
      cooldown: 0,
      subcommands: [
        new Add,
        new Remove,
        new Current
      ],
    })
  };
}