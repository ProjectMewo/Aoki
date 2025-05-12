import { config } from "seyfert";
const dev = process.argv.includes("--dev");

export default config.bot({
  token: process.env[dev ? "TOKEN_DEV" : "TOKEN"] || "",
  locations: {
    base: "src",
    commands: "cmd",
    events: "events"
  },
  intents: [
    "Guilds", 
    "GuildMessages", 
    "DirectMessages",
    "MessageContent",
    "GuildMessageReactions"
  ]
});