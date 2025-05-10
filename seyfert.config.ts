import { config } from "seyfert";

export default config.bot({
  token: process.env.TOKEN_DEV || "",
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