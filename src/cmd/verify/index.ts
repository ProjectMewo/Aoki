import { Declare, Command, Options, Locales } from "seyfert";
import Toggle from "./toggle";
import Status from "./status";
import Customize from "./customize";

@Declare({
  name: "verify",
  description: "manage the verification system for this server",
})
@Locales({
  name: [
    ['en-US', 'verify'],
    ['vi', 'xác-minh']
  ],
  description: [
    ['en-US', 'manage the verification system for this server'],
    ['vi', 'quản lý hệ thống xác minh cho máy chủ này']
  ]
})
@Options([Toggle, Status, Customize])
export default class Verify extends Command {};
