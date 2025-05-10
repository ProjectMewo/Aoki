<h1 align="center"><img src='https://i.imgur.com/Nar1fRE.png' height='100'><br>Aoki</br></h1>
<p align="center">a multi-purpose Discord application to spice up your experiences.<br>focus mainly on anime, fun and utility.</br></p>

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=704992714109878312)
[![License](https://img.shields.io/github/license/ProjectMewo/Aoki?style=for-the-badge)](https://github.com/ProjectMewo/Aoki/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/ProjectMewo/Aoki?style=for-the-badge)](https://github.com/ProjectMewo/Aoki/stargazers)
[![Issues](https://img.shields.io/github/issues/ProjectMewo/Aoki?style=for-the-badge)](https://github.com/ProjectMewo/Aoki/issues)

</div>

---
## Information about this branch

> [!NOTE]
> This branch serves as a **proof-of-concept** of (some parts of) Aoki ported to [Seyfert](https://www.seyfert.dev). It is not stable and will not be so until Seyfert becomes more stable and better structured.

***For you developers***, this branch is a [Seyfert](https://www.seyfert.dev) implementation of Aoki. A part of her, though, because Seyfert's structure is utterly messy to work with when it comes to very complex structuring from Discord.js.

From my benchmarkings, Seyfert's resource usage will ***only** matter to you* when you hit about **1,000 guilds** and above, which also means you probably have a codebase you wouldn't spend time rewrite all of it with the current state of Seyfert —  a hot mess at version 3. Other than that it makes no difference. Just more complex code.

The pros of this library is that you ditch all the command/event/so on loaders you usually have to write from scratch, and a pretty good base to modularize what you want to add. The cons, well, it's *too barebones* to be able to scale to complexity. That's probably why not a lot of people use it although it's been there since 2022.

Another cons of this library is that it... it does not have a documentation that makes sense. The place they lead you to is a *guide*, not a documentation. The lack of JSDoc comments in their source code and the lack of proper documentation in both their source code and their guide is the reason I will never go back — believe it or not, [this is in their source code](https://github.com/tiramisulabs/seyfert/blob/92ab65be7bc75624d41da2e980d7152ff095e0b1/src/commands/handle.ts#L70):

![nice documentation](https://i.imgur.com/VvuyzKn.png)

Also the guide is very, *very* poor in detail. I've made plenty of TypeScript applications, check that out if you like. I understood half the guide, the vital part? Figure it out yourself because you just need to "let the autocomplete of your editor guide you and discover all the possibilities you have." Helpful, thanks.

Also the fact it stood out and told you Sapphire is stupid (yes, yes it is) and that you might want to try it instead — you can read the entire thing [here](https://github.com/tiramisulabs/seyfert/issues/174) — no, it's... not any better. This is what it tells me on their own modal construction on their Modal [guide](https://www.seyfert.dev/guide/components/modals). I have plenty of these not in this branch for a reason.

![nice sapphire slander](https://i.imgur.com/CMnCkSz.png)

[A TextInputRow on the Modal is of type 4](https://discord.com/developers/docs/components/reference#component-object) if you wonder what that says. I guess the typings of the library did not help them do the right thing because, in their own words, "they aren't components."

```ts
// This code is ripped from their own guide about Modals.
import { Modal, TextInput, ActionRow } from 'seyfert';
import { TextInputStyle } from 'seyfert/lib/types';
 
const nameInput = new TextInput()
  .setCustomId('name')
  .setStyle(TextInputStyle.Short)
  .setLabel('Name');

// Typing of the century
const row1 = new ActionRow<TextInput>().setComponents([nameInput]);
...
 
const modal = new Modal()
  .setCustomId('mymodal')
  .setTitle('My Modal')
  .setComponents([row1]);
```

They *aren't* components.

### Huge slander. Why did you try then?
I hate Discord.js.

## Local development setup
Make sure you have Bun v1.2.4+ on your local machine. [Install it here](https://bun.sh). Seyfert also supports Node or whatever it does, check their docs, but I made it work with Bun.

Place all the necessary keys required by first renaming the `.env.example` file to `.env`, and then fill it. **It is recommended that you use only the DEV variant of the keys.**

Start the dev client by running this one-liner (which installs all dependencies and start it):
```bash
bun i && npm run dev
```

## Code License & Contribution
[GPL-3.0](/LICENSE).

This is a learning project pushed to production, use any code that makes sense to you, but don't fully copy the entire thing.

To contribute, simply make a fork of this repository, make your changes, then make a pull request. There is a template ready for a standard PR.

To work with the codebase, specifically this branch, make sure:
- You do not edit `tsconfig.tson` to make whatever you want works.
- You document the code wherever relevant; i.e. stuff that will be hard to look at without it, if you're making a PR.
- You keep the overall structure intact and consistent. Sync with other files if there is already one (or some) of the same format.
- You stay sane and happy.