import { Declare, Command, Options } from "seyfert";
import Fault from "./fault";
import Info from "./info";
import Invite from "./invite";
import Ping from "./ping";
import Rights from "./rights";
import Stats from "./stats";
import Vote from "./vote";

@Declare({
	name: "my",
	description: "commands related to me or my development.",
})
@Options([Fault, Info, Invite, Ping, Rights, Stats, Vote])
export default class My extends Command {};