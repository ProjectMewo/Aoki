import { Declare, Command, Options, GroupsT } from "seyfert";
import Action from "./action";
import Quote from "./quote";
import Random from "./random";
import Profile from "./profile";
import Airing from "./airing";
import Search from "./search";
import Gelbooru from "./gelbooru";
// Schedule subcommand in subcommand group
import Add from './schedule/add';
import Current from './schedule/current';
import Remove from './schedule/remove';

@Declare({
  name: 'anime',
  description: 'commands related to anime stuff'
})
@GroupsT({
  schedule: {
    name: 'anime.scheduleSub.name',
    defaultDescription: 'anime.scheduleSub.description'
  }
})
@Options([Action, Quote, Random, Profile, Airing, Search, Gelbooru, Add, Current, Remove])
export default class Anime extends Command {};
