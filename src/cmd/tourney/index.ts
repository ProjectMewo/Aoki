import Command from "@struct/handlers/Command";
import Make from "./make";
import AddRound from "./add-round";
import Current from "./current";
import Delete from "./delete";
import SetReplayChannel from "./set-replay-channel";

export default class Tournament extends Command {
  constructor() {
    super({
      name: 'tourney',
      description: 'tournament management commands',
      cooldown: 0,
      subcommands: [
        new Make,
        new AddRound,
        new Current,
        new Delete,
        new SetReplayChannel
      ],
    })
  };
}
