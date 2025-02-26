<h1 align="center"><img src='https://i.imgur.com/Nar1fRE.png' height='100'><br>Aoki</br></h1>
<p align="center">a multi-purpose Discord application to spice up your experiences.<br>focus mainly on anime, fun and utility.</br></p>
<p align="center">
  <a href="https://nodejs.org/api/esm.html/">
    <img src="https://i.imgur.com/JJkdjKu.png" height="36"/>
  </a>
  <a href="https://www.digitalocean.com/pricing/droplets/">
    <img src="https://i.imgur.com/9rZ8bLb.png" height="36"/>
  </a>
</p>

---
## Information about this project

***For users***, Aoki is your tsundere helper in Discord, the modern world's favorite messaging app. She "specializes in providing advanced anime information and handy utilities, all within your Discord server." Soon, she'll have native support for [osu!](https://osu.ppy.sh), but now with various things not available in other applications.

You want to know more right now? Head to the [info file](/INFO.md), or [invite her now](https://discord.com/oauth2/authorize?client_id=704992714109878312).

***For developers***, Aoki is a Discord application, available as both a gateway-based app (the current release) and a serverless app (before v4). The serverless app is for Cloudflare Workers. Tagged versions after v3 can be hosted anywhere with Bun and process persistence.

To host the project with traditional Node.js, read below.

## Tech stacks
### Language
Aoki is written in **JavaScript**. There are no plans to rewrite it into another language. Community rewrites are welcome, but they are not official.

CommonJS is not supported. This project uses ESM.

### Database
Aoki uses **MongoDB** in production (v4.1). She uses the `mongodb` library, but release v4.2 has support for `mongoose`. Both logics are interchargable, please check the [Client.js](/src/struct/Client.js) file for more info.

In the future, to better support new infrastructure, Aoki will use **PostgreSQL** instead, using the new built-in `Bun#sql` module. This v4.3 branch has **very, very experimental** support for it, as such please use with caution.

### Runtime
Aoki officially supports Bun v1.2+. It is recommended to use Bun for the time being, because:
- It has native `.env` loading support, so loading it won't be an issue.
- It has built-in `serve()` for web stuff, which is very fast.
- It has built-in support for PostgreSQL, which is also very fast.

Aoki *technically* supports Node.js v18+ if you rewrite the [WebAPI.js](/src/web/WebAPI.js) file to use a different web library (such as `fastify`), install `postgres` then import it into [Client.js](/src/struct/Client.js), and install `dotenv` to load `.env` file.

### Project size
Aoki **heavily relies** on APIs and external projects, and most redundant libraries are implemented as a single function in [Utilities.js](/src/struct/Utilities.js). This is why the project is very small in disk space size and codebase size. After building, the entire codebase and libraries weigh just a fraction more than a single megabyte.

### Future-proof
Check the [roadmap](https://github.com/AokiOfficial/Aoki/issues/6) for future planned implementations.

## Local development setup
Make sure you have Bun v1.2+ on your local machine. [Install it here](https://bun.sh).

Place all the necessary keys required by first renaming the `.env.example` file to `.env`, and then fill it. **It is recommended that you use only the DEV variant of the keys.**

Start the dev client by running this one-liner (which installs all dependencies and start it):
```bash
bun i && npm run dev
```
For Node.js users, or if you prefer to have this running on Node.js, first make sure you [install it here](https://nodejs.org/en). Select Node 20+ to skip `dotenv` installation.

Then, just change the installer and run it:
```bash
npm i && npm run dev
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
│   │   ├── const       # files rarely update
│   │   └── util        # heavy utilities
│   ├── struct     # code structure files
│   │   └── handlers    # handlers
│   ├── events     # Discord.js events
│   ├── extends    # function extenders
│   ├── web        # web API (barebones)
│   └── cmd        # main commands files
└── 
```
The project follows a class-based approach to commands, events and extenders. 
- To make a new command, make a class extending [Command.js](/src/struct/handlers/Command.js).
- To handle a new event, make a class extending [Event.js](/src/struct/handlers/Event.js).
- To extend a new prototype, make a class extending [Extender.js](/src/struct/handlers/Extender.js).

After that, to load the new files, statically import them in [Client.js](/src/struct/Client.js), inside the `loadModules` function.

## Code License & Contribution
[GPL-3.0](/LICENSE).

This is a learning project pushed to production, use any code that makes sense to you, but don't fully copy the entire thing.

To contribute, simply make a fork of this repository, make your changes, then make a pull request. There is a template ready for a standard PR.

To work with the codebase, make sure:
- You adhere to ESM conventions, as Aoki does not support CommonJS.
- You document the code wherever relevant; i.e. stuff that will be hard to look at without it, if you're making a PR.
- You keep the overall structure intact and consistent. Sync with other files if there is already one (or some) of the same format.
- You stay sane and happy.