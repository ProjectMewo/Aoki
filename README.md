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

***For you developers***, this branch is a [Seyfert](https://www.seyfert.dev) implementation of Aoki. It was rewritten once again to support a more modularized method of making commands and lifting the hassle of having to handle that part yourself; and lifting the hassle of handling languages yourself. Seyfert, conveniently, did that.

However you don't get a lot of useful information on Seyfert, because it doesn't have a proper documentation. You have a [guide](https://docs.seyfert.dev) to work with, which is obviously quite insufficient (it took me a century to figure out how modals work here). This rewrite is just a **proof-of-concept**, it is not a fully cleaned up prototype to use in production.

All technologies are still the same, except without Discord.js and with Seyfert.

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