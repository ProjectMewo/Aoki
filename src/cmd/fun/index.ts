import { Declare, Command, Options, Locales } from "seyfert";
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
@Locales({
  name: [
    ['en-US', 'fun'],
    ['vi', 'vui-nhộn']
  ],
  description: [
    ['en-US', 'some commands for funny stuff'],
    ['vi', 'một số lệnh cho những điều vui nhộn']
  ]
})
@Options([Eightball, Advice, Affirmation, Fact, Fortune, Generator, Ship, Today, Truth, Owo])
export default class Fun extends Command {};
