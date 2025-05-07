# Implementing new stuff

This is a guide on how to work with the Aoki codebase.

## Error Handling

Error handling in Aoki must be routed through the [AokiError.ts handler](/src/struct/handlers/AokiError.ts):
```ts
import AokiError from '@struct/handlers/AokiError';
...
return AokiError[shorthand_method]({
  sender: i,     // variable with a `send` or `reply` function
  content: ""    // content of the error
  // more parameters here...
});
...
```
This makes sure all errors are properly categorized and prioritized. The file has multiple shorthand functions for common errors throughout the development of the app, but you can construct one yourself if it's rare enough:
```ts
import AokiError from '@struct/handlers/AokiError';
import { ErrorTypes } from '@struct/handlers/AokiError';
...
const error = new AokiError({ 
  ...options, 
  type: ErrorTypes.SELF_CONSTRUCTED 
});
void error.handle();
// logic if this should be ephemeral or logged...
...
```

## Commands

Aoki's commands follow a very special flow to get to Discord:
- First, create a folder of a `master command`. A master command is a `SubcommandsOnlySlashCommandBuilder`, as in a command with only slash commands in it.
- Create an `index.ts` file in that directory, extending [Command.ts](src/struct/handlers/Command.ts). For example, a `/fun` master command:
```ts
// src/cmd/fun/index.ts
import Command from '@struct/handlers/Command';

export default class Fun extends Command {
  constructor() {
    super({
      name: 'fun',
      description: 'some commands for funny stuff',
      cooldown: 0,
      subcommands: []
    })
  }
}
```
- Then, implement a `subcommand` of the master command in the same folder, extending [Subcommand.ts](src/struct/handlers/Subcommand.ts) this time. For example, a `/fun ping` command:
```ts
// src/cmd/fun/ping.ts
// This file also exports an interface for command options
import { Subcommand } from '@struct/handlers/Subcommand';

export default class Ping extends Subcommand {
  constructor() {
    super({
      name: 'ping',
      description: 'see if I respond.',
      // Even though there are no permission required
      // and no options, they are not optional, so
      // make sure these are all present
      permissions: [],
      options: []
    });
  };
}
```
- The code snippet above shows how to initialize the subcommand in our `/fun` master command. The actual implementation of the command is in the `execute` method, for example:
```ts
// Sub-content of src/cmd/fun/ping.ts
import { ChatInputCommandInteraction } from 'discord.js';

public async execute(i: ChatInputCommandInteraction): Promise<void> {
  // Write normal discord.js code
  await i.reply({ content: "I am watching you!" });
};
```
- After you've made a new subcommand, it's time to let the master command know its presence. Because this project is statically built with `esbuild`, you can't use `node:fs`:
```ts
// src/cmd/fun/index.ts
import Command from '@struct/handlers/Command';
import Ping from './ping';

export default class Fun extends Command {
  constructor() {
    super({
      name: 'fun',
      description: 'some commands for funny stuff',
      cooldown: 0,
      subcommands: [new Ping]
    })
  }
}
```
- To publish this command to Discord, head over to the [Client.ts](src/struct/Client.ts) file and add your newly made folder to the command loader function:
```ts
// Sub-content of src/struct/Client.ts
/**
 * Load commands
 * @returns {Promise<void>}
 */
private async loadCommands(): Promise<void> {
  ...
  const commandModules = await Promise.all([
    ...
    import('../cmd/fun'), // Statically import the folder
  ]);
  ...
};
```
- Run the development bot and publish the command with `bun dev:publish`. Make sure you include your own guild ID in your `.env` file!
- Voilà! Your command is now on Discord, as `/fun ping`.

*This document is work-in-progress. New changes are expected.*
