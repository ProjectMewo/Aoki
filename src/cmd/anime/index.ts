import Command from "@struct/handlers/Command";
import Action from "./action";
import Quote from "./quote";
import Random from "./random";
import Profile from "./profile";
import Airing from "./airing";
import Search from "./search";
import Gelbooru from "./gelbooru";

export default class Anime extends Command {
  constructor() {
    super({
      name: 'anime',
      description: 'commands related to anime stuff',
      cooldown: 0,
      subcommands: [
        new Action,
        new Quote,
        new Random,
        new Profile,
        new Airing,
        new Search,
        new Gelbooru
      ],
    })
  };
}