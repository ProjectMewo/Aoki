import { Declare, Command, Options, Locales } from "seyfert";
import Fault from "./fault";
import Info from "./info";
import Invite from "./invite";
import Ping from "./ping";
import Rights from "./rights";
import Stats from "./stats";
import Language from "./language";
import Beta from "./beta";

@Declare({
	name: "my",
	description: "commands related to me or my development.",
})
@Locales({
	name: [
		['en-US', 'my'],
		['vi', 'hỏi-tớ-về']
	],
	description: [
		['en-US', 'commands related to me or my development.'],
		['vi', 'các lệnh liên quan đến tớ hoặc phát triển của tớ.']
	]
})
@Options([Fault, Info, Invite, Ping, Rights, Stats, Language, Beta])
export default class My extends Command {};