import { Declare, Command, Options, LocalesT } from "seyfert";
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

@Declare({
  name: 'fun',
  description: 'some commands for funny stuff'
})
@LocalesT('fun.name', 'fun.description')
@Options([Eightball, Advice, Affirmation, Fact, Fortune, Generator, Ship, Today, Truth, Owo])
export default class Fun extends Command {};
