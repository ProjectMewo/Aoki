import Command from "@struct/handlers/Command";
import Eightball from "./8ball";
import Advice from "./advice";
import Affirmation from "./affirmation";
import Fact from "./fact";
import Fortune from "./fortune";
import Generator from "./generator";
import Ship from "./ship";
import Today from "./today";
import Truth from "./truth";
import Owo from "./owo";

export default class Fun extends Command {
  constructor() {
    super({
      name: 'fun',
      description: 'some commands for funny stuff',
      cooldown: 0,
      subcommands: [
        new Eightball,
        new Advice,
        new Affirmation,
        new Fact,
        new Fortune,
        new Generator,
        new Ship,
        new Today,
        new Truth,
        new Owo
      ],
    })
  };
}
