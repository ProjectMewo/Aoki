import Client from "./struct/Client.js";
import "./struct/extenders";
(new Client(process.argv.includes("--dev"))).login();
