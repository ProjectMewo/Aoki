// Baseline imports
import { Client, Collection, EmbedBuilder, REST, Routes } from 'discord.js';
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import Settings from './Settings';
import Command from './handlers/Command';
import Event from './handlers/Event';
import Schedule from './Schedule';
import AokiWebAPI from '../web/WebAPI';
import schema from '../assets/schema';
// Utilities
import AnilistUtil from '@utils/AniList';
import ArrayUtil from '@utils/Array';
import DBL from '@utils/DBL';
import LogUtil from '@utils/Logger';
import OsuUtil from '@utils/OsuGame';
import ProfaneUtil from '@utils/Profane';
import TextUtil from '@utils/String';
import TimeUtil from '@utils/Time';
import MiscUtil from '@utils/Misc';
// Configuration file
import config from 'src/config';
const PUBLISH_COMMANDS = process.argv.includes("--publish-commands");

class AokiClient extends Client {
  /**
   * Whether the client is in development mode
   * @type {boolean}
   */
  public dev: boolean;
  /**
   * The configurations of this client
   * @type {typeof config}
   */
  public config: typeof config;
  /**
   * The commands collection of this client instance
   * @type {Collection<string, Command>}
   */
  public commands: Collection<string, Command>;
  /**
   * The events collection of this client instance
   * @type {Collection<string, Event>}
   */
  public events: Collection<string, Event>;
  /**
   * The anime scheduler instance of this client
   * @type {Schedule}
   */
  public schedule: Schedule;
  /**
   * The statistics cache of this client
   * @type {Collection<string, { embed: EmbedBuilder, timestamp: number }>}
   */
  public statsCache: Collection<string, {
    embed: EmbedBuilder,
    timestamp: number
  }>;
  /**
   * The last guild count of this client
   * @type {number | null}
   */
  public lastGuildCount: number | null;
  /**
   * The MongoDB client instance of this client
   * @type {MongoClient | null}
   * @private
   */
  private dbClient: MongoClient | null;
  /**
   * The Mongo database instance of this client
   * @type {Db | null}
   */
  public db: Db | null;
  /**
   * The settings collection of this client
   * @type {Settings}
   */
  public settings: {
    users: Settings;
    guilds: Settings;
    schedules: Settings;
    verifications: Settings;
  };
  /**
   * Utility functions for this client
   */
  public utils = {
    anilist: new AnilistUtil(this),
    array: new ArrayUtil(),
    logger: new LogUtil(),
    osu: new OsuUtil(),
    profane: new ProfaneUtil(),
    string: new TextUtil(),
    time: new TimeUtil(),
    misc: new MiscUtil(),
    dbl: new DBL(this)
  };
  /**
   * The ready status of this client
   * @type {boolean}
   */
  public ready: boolean;

  constructor(dev: boolean) {
    super(config.clientOptions);
    this.dev = dev;
    this.config = config;
    this.commands = new Collection();
    this.events = new Collection();
    this.schedule = new Schedule(this);
    this.statsCache = new Collection();
    this.lastGuildCount = null;
    this.dbClient = null;
    this.db = null;
    this.settings = {
      users: new Settings(this, "users", schema.users),
      guilds: new Settings(this, "guilds", schema.guilds),
      schedules: new Settings(this, "schedules", schema.schedules),
      verifications: new Settings(this, "verifications", schema.verifications)
    };
    this.utils = {
      anilist: new AnilistUtil(this),
      array: new ArrayUtil,
      logger: new LogUtil,
      osu: new OsuUtil,
      profane: new ProfaneUtil,
      string: new TextUtil,
      time: new TimeUtil,
      misc: new MiscUtil,
      dbl: new DBL(this)
    };
    this.ready = false;

    this.once("ready", this.onReady.bind(this));
    this.utils.logger.warn("Logging in...", "[Warn]");
  };

  /**
   * Load commands
   * @returns {Promise<void>}
   */
  private async loadCommands(): Promise<void> {
    const commandData = [];
    const commandModules = await Promise.all([
      import('../cmd/osu'),
      import('../cmd/utility'),
      import('../cmd/my'),
      import('../cmd/fun'),
      import('../cmd/anime'),
      import('../cmd/verify'),
      import('../cmd/schedule'),
    ]);
    for (const commandModule of commandModules) {
      const Command = new commandModule.default;
      this.commands.set(Command.name, Command);
      commandData.push((Command.export()).toJSON());
    };
    this.application?.commands.set(commandData);

    // If the flag is set, publish the commands
    if (!PUBLISH_COMMANDS) return;

    const usedToken = this.dev ?
      process.env.TOKEN_DEV as string :
      process.env.TOKEN as string;
    const rest = new REST({ version: '10' }).setToken(usedToken);

    if (this.dev) {
      // Delete previously set commands
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPID_DEV as string, process.env.GUILD as string),
        { body: [] }
      ).catch(console.error);
      this.utils.logger.success("Deleted previous commands", "[Logger]");
      // Set new commands
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPID_DEV as string, process.env.GUILD as string),
        { body: commandData }
      ).catch(console.error);
      this.utils.logger.success("Set new commands", "[Logger]");
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.APPID as string),
        { body: [] }
      ).catch(console.error);
      this.utils.logger.success("Deleted previous commands", "[Logger]");
      await rest.put(
        Routes.applicationCommands(process.env.APPID as string),
        { body: commandData }
      ).catch(console.error);
      this.utils.logger.success("Set new commands", "[Logger]");
    }
  };

  /**
   * Load Discord events
   * @returns {Promise<void>}
   */
  private async loadEvents(): Promise<void> {
    // load events
    const eventModules = await Promise.all([
      import('../events/interactionCreate'),
      import('../events/messageCreate'),
      import('../events/ready'),
    ]);
    for (const eventModule of eventModules) {
      const event = eventModule.default;
      this.events.set(event.name, event);
      this[event.once ? 'once' : 'on'](event.name, (...args: any[]) =>
        (event.execute as Function).call(undefined, this, ...args)
      );
    };
  };

  /**
   * Load database
   * @returns {Promise<void>}
   */
  private async loadDatabase(): Promise<void> {
    const url = process.env.MONGO_KEY!;
    this.dbClient = await MongoClient.connect(url, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    this.utils.logger.success("Loaded database", "[Logger]");
    this.db = this.dbClient.db();
    
    await Promise.all(Object.values(this.settings).map(settings => settings.init()));
  };

  /**
   * Listen to internal exception throws
   * @param events - Exception names
   * @param config - To ignore exceptions or not
   * @returns {void}
   */
  private listenToProcess(events: string[] = [], config: { ignore: boolean } = { ignore: false }): void {
    for (const event of events) {
      process.on(event, (...args: any[]) => {
        if (config.ignore && typeof config.ignore === "boolean") return;
        return this.utils.logger.processException(event, args, this);
      });
    }
  };

  /**
   * Set ready status after emitting event
   * @returns {void}
   */
  private onReady(): void {
    this.ready = true;
    this.utils.logger.success(`Loaded client: ${this.user!.username}`, "[Loader]");
  };

  /**
   * Load everything
   * @returns {Promise<void>}
   */
  private async init(): Promise<void> {
    this.listenToProcess(
      ['unhandledRejection', 'uncaughtException'], 
      { ignore: false }
    );

    await Promise.all([
      this.loadEvents(),
      this.loadDatabase(),
      this.loadCommands()
    ]);

    new AokiWebAPI(this).serve();
    this.utils.logger.success("Loaded baseline data", "[Loader]");
  }

  /**
   * Log into client
   * @returns {Promise<string>}
   */
  public async login(): Promise<string> {
    await this.init();
    return super.login(
      this.dev ? process.env.TOKEN_DEV : process.env.TOKEN
    );
  }
}

export default AokiClient;
