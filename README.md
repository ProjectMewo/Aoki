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
Previously, Aoki was written in **JavaScript**. To better adapt to modern standards, Aoki is rewritten in TypeScript, which reduces random runtime errors. There are no plans to rewrite it into another language yet, and community adaptation is welcome.

On JavaScript releases, only ESM is supported. CommonJS is not.

### Database
Aoki is built with MongoDB and the `mongodb` library. Other databases are available if you want them instead:
- PostgreSQL - release 4.2 and 4.3 uses `Bun#sql` under the hood.
- MongoDB with `mongoose` was a JavaScript implementation in release 4.1.
- Cloudflare's `D1` database was also a JavaScript implementation for Aoki serverless in release `<=3.0`.

### Runtime
Aoki officially supports **Bun v1.2.4+**. Any Node version should also work as long as it's above the minimum requirement for `discord.js`.

### Project size
Aoki **heavily relies** on APIs and external projects, and most redundant libraries and bite-sized utilities are implemented inside the [utils](/src/struct/utils/) directory. This is why the project is very small in disk space size and codebase size. After building, the entire codebase is less than a hundred kilobytes heavy. The rest of it is for bundling libraries.

### Future-proof
Check the [roadmap](#6) for future planned implementations.

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
├── package.json
├── .env.example   # example secret keys file
├── src            # project source code
│   ├── ...
│   ├── assets     # static JS files
│   ├── struct     # code structure files
│   │   └── extenders   # altering discord.js core
│   │   └── handlers    # handlers
│   │   └── utils       # fragmented utilities
│   ├── types      # type definition for things
│   ├── events     # Discord.js events
│   ├── web        # web API (barebones)
│   └── cmd        # main commands directories
└── 
```
To implement new stuff, read [INSTRUCTIONS.md](/INSTRUCTIONS.md).

## Code License & Contribution
[GPL-3.0](/LICENSE).

This is a learning project pushed to production, use any code that makes sense to you, but don't fully copy the entire thing.

To contribute, simply make a fork of this repository, make your changes, then make a pull request. There is a template ready for a standard PR.

To work with the codebase, specifically this branch, make sure:
- You do not edit `tsconfig.tson` to make whatever you want works.
- You document the code wherever relevant; i.e. stuff that will be hard to look at without it, if you're making a PR.
- You keep the overall structure intact and consistent. Sync with other files if there is already one (or some) of the same format.
- You stay sane and happy.