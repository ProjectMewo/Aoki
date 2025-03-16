import Command from "@struct/handlers/Command";
import Avatar from "./avatar";
import Banner from "./banner";
import Channel from "./channel";
import Server from "./server";
import Github from "./github";
import Npm from "./npm";
import Urban from "./urban";
import Screenshot from "./screenshot";
import Wiki from "./wiki";

export default class Utility extends Command {
  constructor() {
    super({
      name: 'utility',
      description: 'various utility commands',
      cooldown: 0,
      subcommands: [
        new Avatar,
        new Banner,
        new Channel,
        new Server,
        new Github,
        new Npm,
        new Urban,
        new Screenshot,
        new Wiki
      ],
    })
  };
}