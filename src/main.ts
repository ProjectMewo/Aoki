import AokiClient from "@struct/Client";
// Command imports
import Anime from "./cmd/anime";
import Fun from "./cmd/fun";
import My from "./cmd/my";
import OsuGame from "./cmd/osu";
import Utility from "./cmd/utility";
import Verify from "./cmd/verify";
// Events imports
import interactionCreate from "./events/interactionCreate";
import messageCreate from "./events/messageCreate";
import botReady from "./events/botReady";
// Extended structures
import '@struct/extenders';
const client = new AokiClient();
// Load commands, locales and events
// @ts-ignore
client.commands.set([Anime, Fun, My, OsuGame, Utility, Verify]);
client.langs.set([
  { name: 'en-US', file: await import('./locales/en-US') },
  { name: 'vi', file: await import('./locales/vi') }
]);
client.events.set([
  { data: { name: 'interactionCreate', once: false }, run: (i: any) => interactionCreate.run(i, client, 1) },
  { data: { name: 'messageCreate', once: false }, run: (i: any) => messageCreate.run(i, client, 1) },
  { data: { name: 'botReady', once: true }, run: (i: any) => botReady.run(i, client, 1) }
]);
// Log in
await client.login();
