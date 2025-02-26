import { Client, GatewayIntentBits, Partials, Options, Collection, REST, Routes } from 'discord.js';
import Settings from './Settings.js';
import Utilities from './Utilities.js';
import Schedule from './Schedule.js';
import AokiWebAPI from '../web/WebAPI.js';
import DBL from "./DBL.js";
import schema from '../assets/schema.js';

class AokiClient extends Client {
  constructor(dev) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
      ],
      allowedMentions: { parse: ['users'] },
      partials: [Partials.Channel],
      sweepers: Options.DefaultSweeperSettings,
      makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        BaseGuildEmojiManager: 0,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        // limit guild member cache to 100 per guild
        GuildMemberManager: {
          maxSize: 100,
          // retain the bot's own member object when the limit is reached
          keepOverLimit: member => member.id === this.user?.id
        },
        // limit message cache to 50 per channel
        MessageManager: {
          maxSize: 50,
          keepOverLimit: message => message.author.id === this.user?.id
        },
        PresenceManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        // limit user cache to 150
        UserManager: {
          maxSize: 150,
          keepOverLimit: user => user.id === this.user?.id
        },
        VoiceStateManager: 0
      })
    });
    this.commands = new Collection();
    this.events = new Collection();
    this.util = new Utilities(this);
    this.poster = new DBL(this);
    this.schedule = new Schedule(this);
    this.statsCache = new WeakMap();
    this.dev = dev;
    this.lastStats = null;
    this.db = null;
    this.settings = {
      users: new Settings(this, "users"),
      guilds: new Settings(this, "guilds"),
      schedules: new Settings(this, "schedules"),
      verifications: new Settings(this, "verifications")
    };
    this.once("ready", this.onReady.bind(this));
    this.util.warn("Logging in...", "[Warn]");
  };
  /**
   * Load all modules (commands, events and extenders)
   * @returns {Promise<void>}
   */
  async loadModules() {
    // load commands
    const commands = [];
    const loadCommandModules = async () => Promise.all([
      import('../cmd/anime.js'),
      import('../cmd/fun.js'),
      import('../cmd/my.js'),
      import('../cmd/osugame.js'),
      import('../cmd/utility.js'),
      import('../cmd/verify.js'),
    ]);
    const commandModules = await loadCommandModules();
    for (const commandModule of commandModules) {
      const command = commandModule.default;
      this.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
    const rest = new REST({ version: '10' }).setToken(this.dev ? process.env.TOKEN_DEV : process.env.TOKEN);
    if (this.dev) {
      rest.put(Routes.applicationGuildCommands(process.env.APPID_DEV, process.env.GUILD), { body: commands })
        .catch(console.error);
    } else {
      rest.put(Routes.applicationCommands(process.env.APPID), { body: commands })
        .catch(console.error);
    }

    // load events
    const loadEventModules = async () => Promise.all([
      import('../events/interactionCreate.js'),
      import('../events/messageCreate.js'),
      import('../events/ready.js'),
    ]);
    const eventModules = await loadEventModules();
    for (const eventModule of eventModules) {
      const event = eventModule.default;
      this.events.set(event.name, event);
      if (event.once) {
        this.once(event.name, (...args) => event.execute(this, ...args));
      } else {
        this.on(event.name, (...args) => event.execute(this, ...args));
      }
    }

    // load extenders
    const loadExtenderModules = async () => Promise.all([
      import('../extends/user.js'),
      import('../extends/guild.js'),
    ]);
    const extenderModules = await loadExtenderModules();
    for (const extenderModule of extenderModules) {
      const Extender = extenderModule.default;
      new Extender(this).apply();
    }
    this.util.success("Loaded commands, events and extenders", "[Loader]");
  };

  /**
   * Load database
   * @returns {Promise<void>}
   */
  async loadDatabase() {
    const key = process.env.PG_PASS;
    const user = process.env.PG_USER;
    const url = process.env.PG_STRING;
    const database = new Bun.SQL(`postgresql://${user}:${key}@${url}/aoki-dev?sslmode=require`, {
      max: 20, // max connections in pool
      idleTimeout: 30, // close idle connections after 30s
      maxLifetime: 0, // connection lifetime, 0 = inf
      connectionTimeout: 30, // connect timeout
    });
    this.db = await database.connect();
    this.util.success("Loaded database", "[Loader]");
    await schema(this.db);
  };
  /**
   * Listen to internal exception throws
   * @param {Array} events Exception names
   * @param {Object} config To ignore exceptions or not
   */
  listenToProcess(events = [], config = {}) {
    for (const event of events) {
      process.on(event, (...args) => {
        if (config.ignore && typeof config.ignore === "boolean") return;
        else return this.util.processException(event, args, this);
      });
    }
  };
  /**
   * Set ready status after emitting event
   * @returns {Promise<void>}
   */
  onReady() {
    this.ready = true;
    this.util.success(`Loaded client: ${this.user.username}`, "[Loader]");
  };
  /**
   * Load everything
   * @returns {Promise<void>}
   */
  async init() {
    this.listenToProcess(['unhandledRejection', 'uncaughtException'], { ignore: false });
    // load modules
    await this.loadModules();
    await this.loadDatabase();
    // init settings
    await Promise.all(Object.values(this.settings).map(setting => setting.init()));
    // init web server
    new AokiWebAPI(this).serve();

    this.util.success("Loaded settings and web server", "[Loader]");
  };
  /**
   * Log into client
   * @returns {Promise<void>}
   */
  async login() {
    await this.init();
    return super.login(this.dev ? process.env.TOKEN_DEV : process.env.TOKEN);
  };
}

export default AokiClient;
