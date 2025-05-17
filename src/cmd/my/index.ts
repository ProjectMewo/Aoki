import { Declare, Command, Options, LocalesT } from "seyfert";
import Fault from "./fault";
import Info from "./info";
import Invite from "./invite";
import Ping from "./ping";
import Rights from "./rights";
import Stats from "./stats";
import Vote from "./vote";
import Language from "./language";

@Declare({
	name: "my",
	description: "commands related to me or my development.",
})
@LocalesT('my.name', 'my.description')
@Options([Fault, Info, Invite, Ping, Rights, Stats, Vote, Language])
export default class My extends Command {};