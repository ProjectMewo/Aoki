import Command from "@struct/handlers/Command";
import Approve from "./approve";
import Suggest from "./suggest";
import ViewSuggestions from "./view-suggestions";
import View from "./view";
import Replays from "./replays";

export default class Mappool extends Command {
  constructor() {
    super({
      name: 'mappool',
      description: 'mappool management for (osu!) tournaments',
      cooldown: 0,
      subcommands: [
        new Approve,
        new Suggest,
        new ViewSuggestions,
        new View,
        new Replays
      ],
    })
  };
}
