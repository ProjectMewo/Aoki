import {
  GatewayIntentBits,
  Options,
  Partials,
  ClientOptions
} from 'discord.js';

export default {
  // Client ID
  id: "704992714109878312",
  // Log channel ID
  logChannel: "864096602952433665",
  // Bot owners
  owners: ["586913853804249090", "809674940994420736"],
  // Client options
  clientOptions: <ClientOptions>{
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
        keepOverLimit: (member): boolean => member.id == "704992714109878312"
      },
      MessageManager: {
        maxSize: 50,
        keepOverLimit: (message): boolean => message.author.id == "704992714109878312"
      },
      PresenceManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: {
        maxSize: 150,
        keepOverLimit: (user): boolean => user.id == "704992714109878312"
      },
      VoiceStateManager: 0
    })
  }
}