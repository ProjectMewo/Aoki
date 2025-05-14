# Implementing new stuff

This is a guide on how to work with the Aoki codebase.

It assumes you have basic understanding of how Discord API for bots roughly works, and appropriate TypeScript knowledge.

For more realistic examples, refer to the actual files inside the project.

## Table of Contents
- [Error handling](#error-handling)
- [Locales](#locales)
- [Commands](#commands)
- [Extending built-in classes](#extending-built-in-classes)

## Error handling

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

Otherwise, when an error should be thrown but the `sender` is not a `ChatInputCommandInteraction` or a `Message`, you probably should resort to sending with the proper method instead. Some methods are not available or compatible with the class.

## Locales
Aoki's locales are handled quite messily as of now on Seyfert. Right now, you can access locales from the `CommandContext` (this is built into Seyfert), the `AutocompleteInteraction`, `ChatInputCommandInteraction` and `Message` (this is extended in the code) with:

```ts
// Context
// Used in every command
ctx.t.get(locale)[keys in locale];
// AutocompleteInteraction
// Used to retrieve localized choices
interaction.t[keys in locale];
```

These are not all accessed by a `get` function because `CommandContext#t` is a built-in method. You can override it using `Object#defineProperty` (which is described in the section "Extending built-in classes" below), but I would not recommend doing it this way. In the commands, you only shorten this call by a single line, which is not worth it.

---
Also, at times, you might want to have *choices* inside your options.

Because Discord API does not support localized choices out of the box, we have to use the new Autocomplete feature and handle it accordingly. Inside a command option creation, write a callback function like so:

```ts
...
choice_demonstration: createStringOption({
  description: 'demonstrates localized choices',
  autocomplete: async (i: AutocompleteInteraction) => {
    // Get the localized choices
    const localizedChoices = i.t.command.choices.choice_demonstration;
    // This SubCommand#respondWithLocalizedChoices 
    // method is not a built-in function. It is extended 
    // from the original SubCommand class.
    await this.respondWithLocalizedChoices(
      i,
      localizedChoices
    );
  }
});
...
```

The `SubCommand#respondWithLocalizedChoices` method is implemented as a shorthand for both getting the current focused value of the autocomplete field and responding to the input. You can read the implementation in [extenders/SubCommand.ts](/src/struct/extenders/SubCommand.ts).

## Commands

Command creation with Seyfert is simple with the use of the TypeScript experimental feature, Decorators. Read more about this [here](https://www.typescriptlang.org/docs/handbook/decorators.html). For localizations, implement the translations of the command name and description in the translation files.

Aoki's commands philosophy is to make a master command then branching out with subcommands to properly categorize them, e.g. `/anime action` and `/anime search`, so you might want to make a subcommand. The flow is pretty much simple:

```ts
// import stuff here...

// make some options
const options = createStringOption({
  // type: Record<string, {...props}>
  //              ^^^^^^   ^^^^^^^^
  //               name     options
  default_option: {
    required: true,
    description: 'stuff',
    description_localizations: {
      'en-US': 'stuff',
      'vi': 'các thứ'
    }
  }
  // continue...
})

// declare the default command name and description
// using the @Declare decorator:
@Declare({
  name: 'default-name',
  description: 'default-description'
})
// to provide localizations for the command,
// use the @LocalesT decorator.
// this decorator is autocomplete-compatible
// you can scroll through to find the right key
@LocalesT('defaut-name.name', 'default-name.description')
// use the declared options in here...
@Options(options)
export default class DefaultName extends SubCommand {
  // and then provide typings of options as a generic here
  async run(ctx: CommandContext<typeof options>) {
    // then you can use the typed options
    const { default_option } = ctx.options;
    // continue...
  };
};
```

Then, because Aoki is statically built with Bun (which is an `esbuild`-like bundler) and Seyfert's command structuring, we need to let it know the existence of this subcommand.

Surprisingly this is simple:

```ts
// it's recommended to name this index.ts
// and place it in the same folder as the subcommand
// import the subcommand we just made:
import DefaultName from './default-name';
// ...other imports

@Declare({
  name: 'parent-command',
  description: 'the parent command'
})
// to let it know, we provide the subcommands inside 
// the @Options decorator:
@Options([DefaultName])
// if you have subcommand groups, use the @Groups decorator
// or if you have localizations, the @GroupsT decorator
// it is also autocomplete-compatible:
@GroupsT({
  'default-group': {
    name: 'default-name.default-group.name',
    description: 'default-name.default-group.description'
  }
})
// finally declare your command:
export default class ParentCommand extends Command {} // end
```

If you have subcommand groups, then inside of the subcommands of the group, add the `@Group` (without the `s`!) decorator, like this:

```ts
@Group('default-group')
```

That way, you keep all the other file contents intact and commands will still be correctly categorized. Feels like *black magic*, yes?

## Extending built-in classes

Sometimes you might have a need of a shorthand function, or a property accessor. Everything like this happens inside the [extenders folder](/src/struct/extenders/).

For instance, if you need to have some string inside the `CommandContext` through some specific property name, go into the file for that class in there (or create a new one if none exists), and add it in:

```ts
// declare your whatever value/function here
const specific_property_name = 'Very important string';
// let the typescript language server know it:
declare module 'seyfert' {
  interface CommandContext {
    specific_property_name: string
  }
};
// finally export that out
// don't export default! 
// you might want to add other things later too!
export { specific_property_name };
```

When you're done adding it there, you still need to put it inside Seyfert. You have only let the TypeScript server know it is *a valid value with type*, but Seyfert didn't catch up yet. To let it catch up, get into the `index.ts` file and use the ol' reliable `Object#defineProperties`:

```ts
// --- cut ---
import * as AokiCommandContext from './CommandContext';
import { CommandContext } from 'seyfert';
// in that file, Object#defineProperties is defined as
// _defProp:
_defProp(CommandContext.prototype, {
  specific_property_name: { get: AokiCommandContext.specific_property_name }
});
```

That's it! Now you can use it everywhere in your commands.

```ts
console.log(ctx.specific_propery_name); 
// logs: 'Very important string'
```

*This document is work-in-progress. New changes are expected.*
