import { Declare, Command, Options, LocalesT } from "seyfert";
import Avatar from "./avatar";
import Banner from "./banner";
import Channel from "./channel";
import Server from "./server";
import Github from "./github";
import Npm from "./npm";
import Urban from "./urban";
import Screenshot from "./screenshot";
import Wiki from "./wiki";

@Declare({
  name: 'utility',
  description: 'various utility commands'
})
@LocalesT('utility.name', 'utility.description')
@Options([Avatar, Banner, Channel, Server, Github, Npm, Urban, Screenshot, Wiki])
export default class Utility extends Command {};
