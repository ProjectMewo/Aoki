import { config } from "seyfert";
const dev = process.argv.includes("--dev");
const token = dev ? process.env.TOKEN_DEV! : process.env.TOKEN!;

export default config.bot({
  token: token,
  locations: {
    base: "src"
  },
  intents: [
    "Guilds", 
    "GuildMessages", 
    "DirectMessages",
    "MessageContent",
    "GuildMessageReactions"
  ]
});