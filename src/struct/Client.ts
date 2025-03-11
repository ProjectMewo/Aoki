import { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Options, 
  Collection, 
  REST, 
  Routes, 
  EmbedBuilder
} from 'discord.js';
import Settings from './Settings';
import Utilities from './Utilities';
import Command from './handlers/Command';
import Event from './handlers/Event';
import Schedule from './Schedule';
import AokiWebAPI from '../web/WebAPI';
import DBL from "./DBL";
import schema from '../assets/schema';

class AokiClient extends Client {
  public dev: boolean;
  public commands: Collection<string, Command>;
  public events: Collection<string, Event>;
  public util: Utilities;
  public poster: DBL;
  public schedule: Schedule;
  public statsCache: Collection<string, { 
    embed: EmbedBuilder, 
    timestamp: number 
  }>;
  public lastStats: number | null;
  public db: typeof Bun.SQL | null;
  public settings: {
    users: Settings;
    guilds: Settings;
    schedules: Settings;
    verifications: Settings;
  };
  public ready: boolean;

  constructor(dev: boolean) {
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
        GuildMemberManager: {
          maxSize: 100,
          keepOverLimit: (member): boolean => member.id === this.user?.id
        },
        MessageManager: {
          maxSize: 50,
          keepOverLimit: (message): boolean => message.author.id === this.user?.id
        },
        PresenceManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        UserManager: {
          maxSize: 150,
          keepOverLimit: (user): boolean => user.id === this.user?.id
        },
        VoiceStateManager: 0
      })
    });

    this.commands = new Collection();
    this.events = new Collection();
    this.util = new Utilities(this);
    this.poster = new DBL(this);
    this.schedule = new Schedule(this);
    this.statsCache = new Collection();
    this.dev = dev;
    this.lastStats = null;
    this.db = null;
    this.settings = {
      users: new Settings(this, "users"),
      guilds: new Settings(this, "guilds"),
      schedules: new Settings(this, "schedules"),
      verifications: new Settings(this, "verifications")
    };
    this.ready = false;

    this.once("ready", this.onReady.bind(this));
    this.util.warn("Logging in...", "[Warn]");
  }

  /**
   * Load all modules (commands, events and extenders)
   */
  private async loadModules(): Promise<void> {
    // load commands
    const commands: any[] = [];
    const loadCommandModules = async () => Promise.all([
      import('../cmd/anime'),
      import('../cmd/fun'),
      import('../cmd/my'),
      import('../cmd/osugame'),
      import('../cmd/utility'),
      import('../cmd/verify'),
    ]);

    const commandModules = await loadCommandModules();
    for (const commandModule of commandModules) {
      const command = commandModule.default;
      this.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }

    const usedToken = this.dev ? 
      process.env.TOKEN_DEV as string :
      process.env.TOKEN as string;
    const rest = new REST({ version: '10' }).setToken(usedToken);

    if (this.dev) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPID_DEV as string, process.env.GUILD as string), 
        { body: commands }
      ).catch(console.error);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.APPID as string), 
        { body: commands }
      ).catch(console.error);
    }

    // load events
    const loadEventModules = async () => Promise.all([
      import('../events/interactionCreate'),
      import('../events/messageCreate'),
      import('../events/ready'),
    ]);

    const eventModules = await loadEventModules();
    for (const eventModule of eventModules) {
      const event = eventModule.default;
      this.events.set(event.name, event);
      // very sketchy hacky 4am code with undefined somehow appearing
      this[event.once ? 'once' : 'on'](event.name, (...args: any[]) =>
        (event.execute as any).call(undefined, this, ...args)
      );
    }

    this.util.success("Loaded commands and events", "[Loader]");
  }

  /**
   * Load database
   */
  private async loadDatabase(): Promise<void> {
    const key = process.env.PG_PASS;
    const user = process.env.PG_USER;
    const url = process.env.PG_STRING;

    const database = new Bun.SQL(`postgresql://${user}:${key}@${url}/aoki-dev?sslmode=require`, {
      max: 20,
      idleTimeout: 30,
      maxLifetime: 0,
      connectionTimeout: 30,
    });

    this.db = await database.connect();
    this.util.success("Loaded database", "[Loader]");
    await schema(this.db);
  }

  /**
   * Listen to internal exception throws
   * @param events - Exception names
   * @param config - To ignore exceptions or not
   */
  private listenToProcess(events: string[] = [], config: { ignore: boolean } = { ignore: false }): void {
    for (const event of events) {
      process.on(event, (...args: any[]) => {
        if (config.ignore && typeof config.ignore === "boolean") return;
        return this.util.processException(event, args, this);
      });
    }
  }

  /**
   * Set ready status after emitting event
   */
  private onReady(): void {
    this.ready = true;
    this.util.success(`Loaded client: ${this.user!.username}`, "[Loader]");
  }

  /**
   * Load everything
   */
  private async init(): Promise<void> {
    this.listenToProcess(['unhandledRejection', 'uncaughtException'], { ignore: false });
    
    await this.loadModules();
    await this.loadDatabase();
    await Promise.all(Object.values(this.settings).map(setting => setting.init()));
    
    new AokiWebAPI(this).serve();
    this.util.success("Loaded settings and web server", "[Loader]");
  }

  /**
   * Log into client
   */
  public async login(): Promise<string> {
    await this.init();
    return super.login(this.dev ? process.env.TOKEN_DEV : process.env.TOKEN);
  }
}

export default AokiClient;
