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
## Information about this project

***For users***, Aoki is your tsundere helper in Discord, the modern world's favorite messaging app. She "specializes in providing advanced anime information and handy utilities, all within your Discord server." Soon, she'll have native support for [osu!](https://osu.ppy.sh), but now with various things not available in other applications.

You want to know more right now? Head to the [info file](/INFO.md), or [invite her now](https://discord.com/oauth2/authorize?client_id=704992714109878312).

***For developers***, Aoki is a Discord application, available as both a gateway-based app (the current release) and a serverless app (before v4). The serverless app is for Cloudflare Workers. Tagged versions after v3 can be hosted anywhere with Bun and process persistence.

## Tech stacks
### Language
Aoki is written in **JavaScript** on production builds. For type-safe versions, this branch has **very experimental** support for TypeScript, which reduces random runtime errors. There are no plans to rewrite it into another language yet, and community adaptation is welcome.

On JavaScript branches and tags, only ESM is supported. CommonJS is not.

On TypeScript branch (which is this branch here), a lot of hacky code written by an insane developer at 4AM in the morning has been placed in here, which needs fixing. Urgently. Hence the experimental warning.

### Database
Aoki uses **MongoDB** in production (v4.1). She uses the `mongodb` library, but release v4.2 has support for `mongoose`. Both logics are interchargable, please check the [Client.ts](/src/struct/Client.ts) file for more info.

In the future, to better support new infrastructure, Aoki will use **PostgreSQL** instead, using the new built-in `Bun#sql` module. The v4.3 branch and this TypeScript branch has **very, very experimental** support for it, as such please use with caution.

> [!WARNING]
> Starting from release 4.3, Aoki will stop supporting **any** and **all** Bun releases before **v1.2.4**. For your own database safety, it is recommended that you update using `bun upgrade`.
> Technical information about this is in the [Settings.ts file](/src/struct/Settings.ts).

### Runtime
Aoki officially supports **Bun v1.2.4+**.
- It has native `.env` loading support, so loading it won't be an issue.
- It has built-in `serve()` for web stuff, which is very fast.
- It has built-in support for PostgreSQL, which is also very fast.

### Project size
Aoki **heavily relies** on APIs and external projects, and most redundant libraries are implemented as a single function in [Utilities.ts](/src/struct/Utilities.ts). This is why the project is very small in disk space size and codebase size. After building, the entire codebase and libraries weigh just a fraction more than a single megabyte.

### Future-proof
Check the [roadmap](https://github.com/ProjectMewo/Aoki/issues/6) for future planned implementations.

This TypeScript rewrite has not been planned, though...

## Local development setup
Make sure you have Bun v1.2.4+ on your local machine. [Install it here](https://bun.sh).

Place all the necessary keys required by first renaming the `.env.example` file to `.env`, and then fill it. **It is recommended that you use only the DEV variant of the keys.**

Start the dev client by running this one-liner (which installs all dependencies and start it):
```bash
bun i && npm run dev
```

## Project structure
The file tree is fairly simple in construction.
```bash
aoki
├── ...
├── README.md
├── LICENSE
├── package.tson
├── .env.example   # example secret keys file
├── src            # project source code
│   ├── ...
│   ├── assets     # static JS files
│   ├── struct     # code structure files
│   │   └── extenders   # altering discord.ts core
│   │   └── handlers    # handlers
│   ├── events     # Discord.ts events
│   ├── web        # web API (barebones)
│   └── cmd        # main commands files
└── 
```
The project follows a class-based approach to commands, events and extenders. 
- To make a new command, make a class extending [Command.ts](/src/struct/handlers/Command.ts).
- To handle a new event, make a class extending [Event.ts](/src/struct/handlers/Event.ts).

After that, to load the new files, statically import them in [Client.ts](/src/struct/Client.ts), inside the `loadModules` function.

## Code License & Contribution
[GPL-3.0](/LICENSE).

This is a learning project pushed to production, use any code that makes sense to you, but don't fully copy the entire thing.

To contribute, simply make a fork of this repository, make your changes, then make a pull request. There is a template ready for a standard PR.

To work with the codebase, specifically this branch, make sure:
- You do not edit `tsconfig.tson` to make whatever you want works.
- You document the code wherever relevant; i.e. stuff that will be hard to look at without it, if you're making a PR.
- You keep the overall structure intact and consistent. Sync with other files if there is already one (or some) of the same format.
- You stay sane and happy.
