import { Declare, Command, Options } from "seyfert";
import Toggle from "./toggle";
import Status from "./status";
import Customize from "./customize";

@Declare({
  name: "verify",
  description: "manage the verification system for this server",
})
@Options([Toggle, Status, Customize])
export default class Verify extends Command {};
