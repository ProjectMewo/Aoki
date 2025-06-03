import { Mappool } from "@local-types/settings";
import { CommandContext, GuildRole } from "seyfert";

export default {
  // ############### Commands
  anime: {
    scheduleSub: {
      name: 'schedule',
      description: 'configure your anime watchlist.',
      add: {
        name: 'add',
        description: 'add an anime to your watchlist.',
        checkDm: 'Just checking if I can send you messages. Ignore me here, thanks.',
        cannotDm: 'Baka, I can\'t send you direct messages. Go enable them, because when I notify you I\'ll notify you there.',
        moreThanOne: 'Baka, you can only have **one schedule** running at a time.\n\nMy sensei will probably lift this in the future though.',
        notFound: 'O-oh, looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
        notAiring: 'Baka, that\'s not airing. It\'s not an upcoming one too. Maybe even finished, I\'m not gonna check that for you.',
        tracking: (title: string, time: number) => `Got it. Tracking airing episodes for **${title}**. Next episode is airing in about **${time}** hours.`,
        apiError: 'O-oh, something didn\'t click when I tried to save it for you.\n\nMy sensei probably messed up. Try reporting this with `/my fault`.'
      },
      current: {
        name: 'current',
        description: 'get information about your currently subscribed anime',
        noSub: 'Baka, you have no anime subscription.',
        notFound: 'O-oh, the anime disappeared from AniList for some reason.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
        response: (title: string, episode: string, time: number | string) => `Here. You're currently watching **${title}**. Next episode, which is episode **${episode}**, is airing in about **${time}** hours.`,
        apiError: 'O-oh, something didn\'t click when I tried to look it up for you.\n\nMy sensei probably messed up. Try reporting this with `/my fault`.'
      },
      remove: {
        name: 'remove',
        description: 'remove your current anime subscription',
        noSub: 'Baka, you have no anime subscription.',
        notFound: 'O-oh, the anime disappeared from AniList for some reason.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
        response: (title: string) => `Alright. I'll stop reminding you about **${title}** just so you have a good sleep at night.`,
        apiError: 'O-oh, something didn\'t click when I tried to look it up for you.\n\nMy sensei probably messed up. Try reporting this with `/my fault`.'
      }
    },
    action: {
      name: "action",
      description: "get a random anime action image",
      choices: [
        { name: "waifu", value: "waifu" }, { name: "neko", value: "neko" },
        { name: "shinobu", value: "shinobu" }, { name: "megumin", value: "megumin" },
        { name: "bully", value: "bully" }, { name: "cuddle", value: "cuddle" },
        { name: "cry", value: "cry" }, { name: "hug", value: "hug" },
        { name: "awoo", value: "awoo" }, { name: "kiss", value: "kiss" },
        { name: "lick", value: "lick" }, { name: "pat", value: "pat" },
        { name: "smug", value: "smug" }, { name: "bonk", value: "bonk" },
        { name: "yeet", value: "yeet" }, { name: "blush", value: "blush" },
        { name: "smile", value: "smile" }, { name: "wave", value: "wave" },
        { name: "highfive", value: "highfive" }, { name: "handhold", value: "handhold" },
        { name: "nom", value: "nom" }, { name: "bite", value: "bite" },
        { name: "glomp", value: "glomp" }, { name: "slap", value: "slap" },
        { name: "kick", value: "kick" }
      ],
      fail: 'O-oh, something didn\'t click. The service is probably down, probably wait a little bit?\n\nTell my sensei if it went on for too long. Do that with `/my fault`.',
      desc: 'Here. Not like I wanted to look it up!',
      apiError: 'O-oh, something didn\'t click when I tried to look it up for you.\n\nMy sensei probably messed up. Try reporting this with `/my fault`.'
    },
    airing: {
      name: 'airing',
      description: 'get a list of anime airing on a specific day',
      choices: [
        { name: 'Sunday', value: 'sunday' },
        { name: 'Monday', value: 'monday' },
        { name: 'Tuesday', value: 'tuesday' },
        { name: 'Wednesday', value: 'wednesday' },
        { name: 'Thursday', value: 'thursday' },
        { name: 'Friday', value: 'friday' },
        { name: 'Saturday', value: 'saturday' }
      ],
      apiError: 'Oh. The service is probably dead. Wait a little bit, then try again.',
      notFound: 'O-oh, looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
      undocErr: 'Wow, this kind of error has never been documented. Wait for about 5-10 minutes.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
    gelbooru: {
      name: 'gelbooru',
      description: 'search for anime images on Gelbooru',
      noSfw: 'Baka, you know what this website is about. This can only be used in a NSFW channel.',
      apiError: 'O-oh, something didn\'t click. The service is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
      notFound: 'Couldn\'t find any post with those tags. Try different tags, and make sure to split tags with spaces.',
      search: 'Gelbooru Search',
      score: 'Score',
      rating: 'Rating',
      tags: 'Tags',
      page: 'Page'
    },
    profile: {
      name: "profile",
      description: "get an anime profile from MyAnimeList or AniList",
      noNsfw: 'Stop sneaking in bad content please, you baka. Be more cultured!',
      notFound: 'O-oh, looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
      apiError: 'O-oh, something didn\'t click. The service is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
      undocErr: 'Wow, this kind of error has never been documented. Wait for about 5-10 minutes.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
    quote: {
      name: 'quote',
      description: 'get a random anime quote.',
      apiError: 'The characters refused to talk to me, how sad. Probably try bother me a little bit later?\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
    random: {
      name: 'random',
      description: 'Get a random anime or manga from MyAnimeList',
      notFound: 'O-oh, looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
      apiError: 'O-oh, something didn\'t click. The service is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
      undocErr: 'Wow, this kind of error has never been documented. Wait for about 5-10 minutes.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
    search: {
      name: 'search',
      description: 'search for anime, manga, characters, or people on MyAnimeList',
      noNsfw: 'Oh. What I found was R-17+ content, which I can\'t really show here. Get in a NSFW channel, then get back to me.',
      notFound: 'O-oh, looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`.',
      apiError: 'O-oh, something didn\'t click. The service is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
      undocErr: 'Wow, this kind of error has never been documented. Wait for about 5-10 minutes.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
  },
  fun: {
    name: 'fun',
    description: 'some commands for funny stuff',
    "8ball": {
      name: '8ball',
      description: 'ask the magic 8-ball a question.',
      noNsfw: 'Baka, give me some respect and don\'t swear. Be more cultured!',
      // TODO: function to get different keys in different langs
    },
    advice: {
      name: 'advice',
      description: 'get a random piece of advice.',
      apiError: 'Couldn\'t give you a great advice right now, I\'m a little busy. Try again in a little bit.\n\nMy sensei probably messed up if I refuse to answer again. Try reporting this with `/my fault`.'
    },
    affirmation: {
      name: 'affirmation',
      description: 'get a positive affirmation to brighten your day.',
      apiError: 'Couldn\'t be super positive right now, I\'m a little busy. Try again in a little bit.\n\nMy sensei probably messed up if I refuse to answer again. Try reporting this with `/my fault`.'
    },
    fact: {
      name: 'fact',
      description: 'get a random fact.',
      apiError: 'One would be I\'m a little busy right now trying to connect. Try again in a little bit.\n\nMy sensei probably messed up if I refuse to answer again. Try reporting this with `/my fault`.'
    },
    fortune: {
      name: 'fortune',
      description: 'get your daily fortune cookie.',
      apiError: 'Fortune cookie? I ran out of that, I\'ll go get one in a little, I\'m a little busy. Try again in a little bit.\n\nMy sensei probably messed up if I refuse to answer again. Try reporting this with `/my fault`.'
    },
    generator: {
      name: 'generator',
      description: 'generate a meme using a template.',
      apiError: 'My image processor is being fixed up, hang tight. Try again in a little bit.\n\nMy sensei probably messed up, I can\'t fix this myself! Try reporting this with `/my fault`.',
      desc: 'Here you go. N-not like I wanted to spend time doing this!',
      footer: (author: string) => `Requested by ${author}`
    },
    owo: {
      name: 'owo',
      description: 'convert your text to OwO speak.',
      apiError: 'OwO what\'s this?! A wild :bug: again?!\n\nMy sensei probably messed up, I can\'t take it out myself! Try reporting this with `/my fault`.'
    },
    ship: {
      name: 'ship',
      description: 'ship two users together and see their compatibility.',
      response: (rate: number) => {
        if (rate === 0) {
          return `Woah, that's impressive. I've never seen this happen before.\n\n||That's a **0%** ship rate, consider you two lucky.||`;
        } else if (rate <= 30) {
          return `You two stood no chance. I don't like **${rate}%**, and maybe you don't, too.`;
        } else if (rate <= 50) {
          return `Fair, I'd say you two need some time. You two scored **${rate}%**, not like I like the rate or something.`;
        } else if (rate <= 70) {
          return `Alright, that's fine. You two scored **${rate}%**, I think I like that.`;
        } else if (rate <= 99) {
          return `Hey! That's pretty good, I rarely see a couple scoring this nicely. A whopping **${rate}%**!`;
        } else if (rate === 100) {
          return `Holy cow. Perfect couple right here duh? **100%** ship rate!`;
        }
      },
      luckyWheel: {
        start: "Lucky wheel time! Let's see if you two are lucky!",
        success: "Hey, good couple! You rolled **100%**!",
        failure: "Baka, you two lost. **0%** rate."
      },
      selfShip: "Pfft. No one does that, baka.",
      botShip: "Ew, I'm not a fan of shipping. Choose someone else!"
    },
    today: {
      name: 'today',
      description: 'get a historical event that happened on today\'s date.',
      apiError: 'O-oh, the historian just walked out for a little break. Try again in a little, will you?\n\nIf he left for too long, tell my sensei! Try reporting that with `/my fault`.'
    },
    truth: {
      name: 'truth',
      description: 'get a random truth question for truth or dare.',
      apiError: 'The question is so shivering I can\'t spit it out! Maybe try again? My sensei probably messed up, too.\n\nTry reporting that with `/my fault` if that\'s the case!'
    }
  },
  my: {
    name: 'my',
    description: 'commands tied to my development and stuff',
    language: {
      name: 'language',
      description: 'configure the language you want me to speak to you.',
      choices: [
        { name: 'English', value: 'en-US' },
        { name: 'Vietnamese', value: 'vi' }
      ],
      response: `Alright, I'll speak to you in **English**!`
    },
    fault: {
      name: 'fault',
      description: 'report an issue with the bot.',
      noInput: "Baka, I can't send nothing. At least give me an error message, an image, or something!",
      gibberishDetected: "I see you typing gibberish there, you baka.",
      gibberishWarning1: "You're not sending [these](https://i.imgur.com/C5tvxfp.png) through me, please.",
      gibberishWarning2: "I'll like [these](https://i.imgur.com/FRWBFXr.png) better.",
      thankYouFeedback: "Thank you for your feedback. The note will be resolved after a few working days.\n\nAlso turn on your DMs! My sensei will most likely reach out to you in person!",
      nonImageAttachment: "Appreciate your attachment, but for now we only support images."
    },
    info: {
      name: "info",
      description: "get information about me.",
      desc: [
        "Oh, it's you? Hey, I'm **Aoki**. It only means a mere blue tree, but sensei (`shimeji.rin`, by the way) can't do anything about it, unfortunately.\n",
        "Everyone calls me a tsundere. Even my sensei does that on my [Github](https://github.com/ProjectMewo/Aoki) - yes, I'm **open-source**, and documented. But I don't think I am one, it's just because *I occasionally slap people*, sorry."
      ].join("\n"),
      fieldOne: {
        name: "What can you do?",
        value: "Probably providing advanced anime information and some little utilities so you don't have to open a browser."
      },
      fieldTwo: {
        name: "Why isn't there a help command?",
        value: "I have written descriptions for them, they're slash commands. Just follow them to get what you want, *sigh*. I'm busy, I don't have time to write those."
      },
      fieldThree: {
        name: "How can I take you to my server?",
        value: "Oh, you want me in your server? Great. [Click here to take me there.](https://discord.com/oauth2/authorize?client_id=898267773755947018&permissions=8&scope=applications.commands%20bot)\nI'm quite exited to see what you have."
      },
      madeWLove: 'Made with ❤'
    },
    invite: {
      name: "invite",
      description: "take me to your server.",
      desc: [
        "Hey, you want to take me to your server? Great. Let's make your server a little more lively.\n",
        `[Click here to take me there.](https://discord.com/oauth2/authorize?client_id=898267773755947018)`,
        "I'm quite exited to see what you have."
      ].join("\n"),
      title: 'Invite me?',
      madeWLove: 'Made with ❤'
    },
    ping: {
      name: "ping",
      description: "see if I respond.",
      responses: [
        "Ugh, again? You always wanna bother me. I responded in {{ms}}ms.",
        "Baka, I responded in {{ms}}ms.",
        "Here you go, I responded in {{ms}}ms. Not like I wanted to waste my time.",
        "Here you go, not that it was worth my time. It only took me {{ms}}ms.",
        "Is this right? I've responded in {{ms}}ms.",
        "{{user}}? I've responded in {{ms}}ms.",
        "{{user}}! You wasted {{ms}}ms of my time, ERGH.",
        "Did I do it right? I responded in {{ms}}ms.",
        "{{user}}, yes I'm here, and it took me {{ms}}ms to respond.",
        "{{user}}, why are you pinging me? You wasted {{ms}}ms of my time.",
        "Hey {{user}}, it took me {{ms}}ms to send this message",
        "You've made me {{ms}}ms older - just from asking.",
        "{{user}}, I've seen your message and it took me {{ms}}ms not to care.",
        "Do you know how long it took me to read that message? You pretty much wasted {{ms}}ms of my day!",
        "I responded in {{ms}}ms, you happy now?"
      ]
    },
    rights: {
      name: 'rights',
      description: 'configure your personal privacy settings',
      choices: [
        { name: 'read & process your messages', value: 'processMessagePermission' },
        { name: 'save your osu! profile details on verification', value: 'saveOsuUserAccount' }
      ],
      isCurrent: (bool: boolean, key: string) => `Yeah, I ${bool ? "can" : "can't"} ${key} anyway because you already ${bool ? "enabled" : "disabled"} it before.`,
      readProcess: 'read & process your messages',
      saveOsu: 'save your osu! profile details on verification',
      set: (value: boolean, key: string) => `Alright, I **${value ? 'will' : 'won\'t'}** ${key}.`,
      apiError: 'O-oh, something didn\'t click. My database is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
    },
    stats: {
      name: "stats",
      description: "the nerdy statistics of how I'm working.",
      author: 'Raw Statistics',
      footer: 'Probably a moron',
      system: 'System',
      app: 'App',
      systemField: {
        ram: 'RAM',
        free: 'Free',
        totalUsed: 'Used Total',
        procLoad: 'Process Use',
        cpuLoad: 'CPU Load',
        sysUp: 'System Uptime'
      },
      appField: {
        cliVer: 'Client Version',
        cliUp: 'Client Uptime',
        cmdCount: 'Commands',
        srvCount: 'Servers',
        usrCount: 'Users',
        usrOnSrvRatio: 'Avg. User/Server'
      },
      desc: {
        linKern: 'Linux Kernel',
        nodeVer: 'Node',
        seyfertVer: 'Seyfert',
        cpuType: 'CPU',
        unknownClockSpeed: 'Unknown'
      }
    },
    vote: {
      name: 'vote',
      description: 'get my vote link.',
      replies: ["Vote? Sweet.", "You finally decided to show up?", "Oh, hi. I'm busy, so get it done.", "Not like I'm not busy, but sure."],
      doThatHere: 'Do that here.',
      thanks: 'If you decided to vote, thank you. My sensei told me you\'ll get extra perks in the future!'
    }
  },
  osu: {
    genericRoundChoices: [
      { name: 'Qualifiers', value: 'Qualifiers' },
      { name: 'Group Stage', value: 'Group Stage' },
      { name: 'Round of 32', value: 'Round of 32' },
      { name: 'Round of 16', value: 'Round of 16' },
      { name: 'Quarterfinals', value: 'Quarterfinals' },
      { name: 'Semifinals', value: 'Semifinals' },
      { name: 'Finals', value: 'Finals' },
      { name: 'Grand Finals', value: 'Grand Finals' }
    ],
    mappool: {
      name: 'mappool',
      description: 'manage the tournament\'s mappool.',
      approve: {
        name: 'approve',
        description: 'approve a map and move it to the current round\'s finalized mappool.',
        noTournament: 'Baka, no tournament exists in this server. You need to create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to add maps to the mappool, you baka. Only hosts, advisors and mappoolers can do this.',
        noActiveRound: 'Oh. There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.',
        noMappool: (currentRound: string) => `Didn\'t find any mappool for **${currentRound}**. Create it first with \`/tourney add-round\`.`,
        invalidSlot: (slot: string, availableSlots: string[], currentRound: string) => `Baka, the slot "${slot}" doesn't exist in the ${currentRound} mappool.\n\nThese are the available slots: ${availableSlots.join(', ')}`,
        invalidUrl: 'Baka, that\'s not a valid beatmap URL. Provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).',
        fetchError: 'O-oh, something didn\'t click. My database is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
        mapUpdated: (title: string, url: string, slot: string, currentRound: string) => `Got it. Updated [${title}](${url}) for **${slot}** in the ${currentRound} mappool.`,
        mapAdded: (title: string, url: string, slot: string, currentRound: string) => `Got it. Added [${title}](${url}) for **${slot}** to the ${currentRound} mappool.`
      },
      replays: {
        name: 'replays',
        description: 'view saved replays for a specific round or the current mappool.',
        noTournament: 'Baka, no tournament exists in this server. You need to create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to view replay files of this pool, you baka. Only tournament organizers, advisors, and test/replayers can access this command.',
        noActiveRound: 'Oh. No round is currently active, and no round was specified. Remind the organizer to set up the current round by doing `/tourney current`.',
        noMappool: (selectedRound: string) => `Didn't find any mappool format for **${selectedRound}**. Remind the organizer to set up the current mappool for this round by doing \`/tourney add-round\`.`,
        noReplays: (selectedRound: string) => `Oh. There are no replays saved for **${selectedRound}**.`,
        response: (selectedRound: string, replays: { slot: string; messageUrl: string; replayer: string }[]) =>
          `**Replays for ${selectedRound}:**\n` +
          replays.map(replay => `- [Replay for ${replay.slot}](${replay.messageUrl}) by **${replay.replayer}**`).join('\n')
      },
      suggest: {
        name: 'suggest',
        description: 'suggest a new map for this mappool slot.',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to suggest maps for the mappool, you baka. Only organizers, advisors, mappoolers, and test/replayers can suggest maps.',
        noActiveRound: 'Oh. There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.',
        noMappool: (currentRound: string) => `Didn\'t find any mappool format for **${currentRound}**. Remind your organizer to provide all slots of this mappool!`,
        invalidSlot: (slot: string, availableSlots: string[], currentRound: string) => `The slot **${slot}** doesn't exist in the **${currentRound}** mappool. Available slots: ${availableSlots.join(', ')}`,
        invalidUrl: 'Baka, that\'s not a valid beatmap URL. Provide either a full URL (e.g., <https://osu.ppy.sh/beatmapsets/1234#osu/5678>) or a shortened URL (e.g., <https://osu.ppy.sh/b/5678>).',
        alreadySuggested: (slot: string) => `Hey! This map has already been suggested for slot ${slot}, you baka.`,
        suggestionAdded: (slot: string, currentRound: string) => `Got it. Added your suggestion for **${slot}** in the **${currentRound}** mappool.`,
        confirmPrompt: 'Nice, good trolling there, you baka.\n\nOr are you genuine? Tell your organizer, or just ask me what is the current set round with `/tourney current`.'
      },
      viewSuggestions: {
        name: 'view-suggestions',
        description: 'view all map suggestions for the current round.',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to view map suggestions, you baka. Only organizers, advisors, mappoolers, and test/replayers can access this command.',
        noActiveRound: 'Oh. There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.',
        noMappool: (currentRound: string) => `Didn\'t find any mappool format for **${currentRound}**. Remind your organizer to set up the mappool slots!`,
        noSuggestions: (currentRound: string) => `Oh. No suggestions have been made for the **${currentRound}** mappool yet.`,
        failedToLoad: (url: string) => `- [Failed to load] (${url})`,
        suggestionTitle: (currentRound: string) => `Suggestions - ${currentRound}`,
        suggestionDescription: (slot: string, mapsText: string) => `Slot: **${slot}**\nMaps:\n${mapsText}`
      },
      view: {
        name: 'view',
        description: 'view the finalized mappool for the current round.',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to view the mappool. Only hosts, advisors, mappoolers, and test/replayers can access this command.',
        noActiveRound: 'Oh. There is no active round set for this tournament. Remind an organizer to set the current round first with `/tourney current`.',
        noMappool: (currentRound: string) => `Didn\'t find any mappool format for **${currentRound}**. Remind your organizer to set up the mappool!`,
        noMaps: (currentRound: string) => `Oh. No maps have been confirmed for the ${currentRound} mappool yet.`,
        mapUnavailable: (slot: string, url: string) => `**${slot}**: [Map information unavailable] (Map URL: ${url})`,
        mapError: (slot: string, url: string) => `**${slot}**: [Error fetching map details] (Map URL: ${url})`,
        mapDetails: (slot: string, artist: string, title: string, version: string, url: string, od: string, hp: string, star: string) =>
          `**${slot}**: [${artist} - ${title} [${version}]](${url})\n\`OD: ${od}, HP: ${hp}, SR: ${star}\``,
        embedTitle: (currentRound: string) => `Finalized picks for ${currentRound}`
      }
    },
    tourney: {
      name: 'tourney',
      description: 'tournament management.',
      addRole: {
        name: 'add-role',
        description: 'add additional roles to a tournament roleset',
        choices: [
          { name: 'Host', value: 'host' },
          { name: 'Advisor', value: 'advisor' },
          { name: 'Mappooler', value: 'mappooler' },
          { name: 'Tester/replayer', value: 'testReplayer' },
          { name: 'Mapper', value: 'customMapper' }
        ],
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to add roles to rolesets, you baka. Only hosts can do this.',
        roleAlreadyAdded: (roleId: string, roleset: string) => `Baka, <@&${roleId}> is already part of the **${roleset}** roleset.`,
        roleAdded: (roleId: string, roleset: string) => `Got it. Added <@&${roleId}> to the **${roleset}** roleset.`
      },
      addRound: {
        name: 'add-round',
        description: 'add a tournament round with mappool slots',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        profane: 'Keep your tournament round name friendly, please. I wouldn\'t allow that.',
        noPermission: 'Hey! You do not have permission to add tournament rounds, you baka. Only hosts, advisors, and mappoolers can do this.',
        noSlots: 'Baka. You must provide at least one mappool slot.',
        roundExists: (round: string) => `Oh. A mappool for ${round} already exists. Use \`/mappool add\` to add maps to it.`,
        success: (round: string, slots: string[], setCurrent: boolean) =>
          `Got it. Added ${round} with ${slots.length} slots: ${slots.join(', ')}.\n` +
          (setCurrent ? `This is now set as the current active round.` : `Use \`/tourney current ${round}\` to set this as the current round.`)
      },
      current: {
        name: 'current',
        description: 'view or set the current tournament round',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noActiveRound: (name: string, abbreviation: string) =>
          `**${name}** (${abbreviation}) doesn't have a current active round set.\n\nUse \`/tourney current [round]\` to set one.`,
        slotInfo: (currentMappool: Mappool | undefined) => currentMappool && currentMappool.slots.length > 0
          ? `Available slots: ${currentMappool.slots.join(', ')}`
          : 'No slots defined for this round.',
        currentRoundInfo: (name: string, abbreviation: string, currentRound: string, slotInfo: string) =>
          `**${name}** (${abbreviation}) is currently in the **${currentRound}** stage.\n\n${slotInfo}`,
        noPermission: 'Hey! You do not have permission to change the current round, you baka. Only hosts and advisors can do this.',
        roundNotFound: (round: string) =>
          `The round "${round}" doesn't exist in this tournament. Add it first with \`/tourney add-round\`.`,
        roundSetSuccess: (name: string, round: string, slots: string[]) =>
          `Got it. The current round of **${name}** is now **${round}**.\n\nAvailable slots: ${slots.join(', ')}`
      },
      delete: {
        name: 'delete',
        description: 'delete the current tournament in this server',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to delete this tournament, you baka. Only hosts can do this.',
        confirmPrompt: (name: string, abbreviation: string) =>
          `Are you sure you want to delete the tournament **${name}** (${abbreviation})? This action cannot be undone!`,
        verySure: 'Yes, I\'m very sure!',
        success: (name: string, abbreviation: string) =>
          `Got it. Deleted the tournament **${name}** (${abbreviation}).`
      },
      make: {
        name: 'make',
        description: 'create a new tournament in this server',
        noPermission: 'Hey! You do not have permission to create a tournament, you baka. Only server administrators can do this.',
        alreadyExists: (name: string, abbreviation: string) =>
          `A tournament already exists in this server: **${name}** (${abbreviation}). You need to reset it before creating a new one.`,
        success: (name: string, abbreviation: string, roles: (GuildRole | undefined)[]) =>
          `Got it. Created tournament **${name}** (${abbreviation})!\n\n` +
          `Assigned roles:\n` +
          roles.map(role => role?.id ? `- <@${role.id}>` : "").join('\n') +
          `\nUse \`/tourney add-round\` to set up rounds and mappools.\n\n***Please note:** Due to the scope of the current project, only **osu!taiko** receive regular support.*`
      },
      setReplayChannel: {
        name: 'set-replay-channel',
        description: 'set a channel for replays for a specific round',
        noTournament: 'Baka, no tournament exists in this server. Create one with `/tourney make` first.',
        noPermission: 'Hey! You do not have permission to set the replay channel, you baka. Only hosts and advisors can do this.',
        roundNotFound: (round: string) => `Baka, **${round}** does not exist in the tournament. Add it first.`,
        success: (round: string, channelId: string) => `Replays for the **${round}** round will now be sent to <#${channelId}>.`
      }
    },
    beatmap: {
      name: "beatmap",
      description: "search for beatmaps by query",
      choices: {
        status: [
          { name: "Ranked", value: "ranked" },
          { name: "Qualified", value: "qualified" },
          { name: "Loved", value: "loved" },
          { name: "Pending", value: "pending" },
          { name: "Graveyard", value: "graveyard" },
          { name: "Any", value: "any" }
        ],
        sort: [
          { name: "Relevance", value: "relevance" },
          { name: "Date (newest)", value: "plays" },
          { name: "Difficulty", value: "difficulty" }
        ],
        langs: [
          { name: "Any", value: "any" },
          { name: "Other", value: "other" },
          { name: "English", value: "english" },
          { name: "Japanese", value: "japanese" },
          { name: "Chinese", value: "chinese" },
          { name: "Instrumental", value: "instrumental" },
          { name: "Korean", value: "korean" },
          { name: "French", value: "french" },
          { name: "German", value: "german" },
          { name: "Swedish", value: "swedish" },
          { name: "Spanish", value: "spanish" },
          { name: "Italian", value: "italian" }
        ],
        genre: [
          { name: "Any", value: "any" },
          { name: "Unspecified", value: "unspecified" },
          { name: "Video Game", value: "video-game" },
          { name: "Anime", value: "anime" },
          { name: "Rock", value: "rock" },
          { name: "Pop", value: "pop" },
          { name: "Other", value: "other" },
          { name: "Novelty", value: "novelty" },
          { name: "Hip Hop", value: "hip-hop" },
          { name: "Electronic", value: "electronic" },
          { name: "Metal", value: "metal" },
          { name: "Classical", value: "classical" },
          { name: "Folk", value: "folk" },
          { name: "Jazz", value: "jazz" }
        ]
      },
      noResults: "No beatmaps found matching your criteria.",
      nsfwResults: "Baka, all of the results I found were NSFW. Be more cultured.",
      stringSelectDesc: (mapper: string, status: string) => `Mapper: ${mapper} | Status: ${status}`,
      selectPlaceholder: (count: number) => `Listing ${count} top result${count === 1 ? "" : "s"}. Select to view.`,
      embed: {
        author: (creator: string) => `Mapped by ${creator}`,
        description: (id: number) =>
          `:notes: [Song preview](https://b.ppy.sh/preview/${id}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${id}/covers/raw.jpg)`,
        footer: (count: number, status: string) => `This set has ${count} ${status} beatmaps`,
        status: (status: string, rankedDate?: string) =>
          `${status}${rankedDate ? ` on ${rankedDate}` : ""}`,
        fieldNames: {
          rawT: 'Raw Title',
          source: 'Source',
          bpm: "BPM",
          favs: 'Favorites',
          spotStats: 'Spotlight Status',
          setId: 'Set ID',
          nsfw: 'Is NSFW?',
          updated: 'Last Updated',
          status: 'Status',
          on: 'on'
        }
      },
      buttons: {
        osuWebDownload: "osu!web download",
        osuDirectDownload: "osu!direct download"
      },
      apiError: 'O-oh, something didn\'t click. My database is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    },
    countryLb: {
      name: "country-leaderboard",
      description: "get a country leaderboard for a specific beatmap",
      choices: {
        sort: [
          { name: "Performance (PP)", value: "performance" },
          { name: "Score V3 (lazer)", value: "lazer_score" },
          { name: "Score V1 (stable)", value: "stable_score" },
          { name: "Combo", value: "combo" },
          { name: "Accuracy", value: "accuracy" }
        ]
      },
      invalidCountryCode: 'Baka, that\'s not a 2-letter country code.',
      noPlayersFound: (countryCode: string) => `Didn't find anyone for country code ${countryCode}. Typo?`,
      noScoresFound: (countryCode: string) => `No scores found for ${countryCode} on this beatmap.`,
      apiError: 'O-oh, an error occurred while fetching the country leaderboard. Please try again later.\n\nTell my sensei with `/my fault` if it lasted too long.',
      embed: {
        title: (artist: string, title: string, version: string) => `${artist} - ${title} [${version}]`,
        author: 'Country leaderboard',
        description: (beatmapsetId: number) =>
          `:notes: [Song preview](https://b.ppy.sh/preview/${beatmapsetId}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/raw.jpg)`,
        footer: (sortString: string, pageIndex: number, totalPages: number) =>
          `Sorted by ${sortString} | Page ${pageIndex + 1} of ${totalPages}`,
        image: (beatmapsetId: number) =>
          `https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/cover.jpg`
      },
      scoreSet: 'Score set',
      sortingOptions: ["Performance", "ScoreV3 (lazer)", "ScoreV1 (stable)", "Combo", "Accuracy"]
    },
    profile: {
      name: 'profile',
      description: 'get osu! profile information',
      notConfigured: "You didn't configure your in-game info, baka. I don't know you.\n\nConfigure them with `/osu set` so I can store it.",
      invalidUsername: "Baka, the username is invalid.",
      userNotFound: "Baka, that user doesn't exist.",
      embed: {
        author: (mode: string, username: string) => `osu!${mode} profile for ${username}`,
        description: (profile: {
          rank: string;
          country: string;
          countryRank: string;
          level: string;
          pp: string;
          accuracy: string;
          playCount: string;
          playTime: string;
          grades: string;
        }, combinedGrades: string) => [
          `**▸ Bancho Rank:** #${profile.rank} (${profile.country}#${profile.countryRank})`,
          `**▸ Level:** ${profile.level[1]}% of level ${profile.level[0]}`,
          `**▸ PP:** ${profile.pp} **▸ Acc:** ${profile.accuracy}%`,
          `**▸ Playcount:** ${profile.playCount} (${profile.playTime} hrs)`,
          `**▸ Ranks:** ${combinedGrades}`,
          `**▸ Profile image:** (from [lemmmy.pw](https://lemmmy.pw))`
        ].join("\n"),
        footer: "Ooh"
      }
    },
    set: {
      name: "set",
      description: "set your osu! username and default mode",
      invalidUsername: 'Baka, the username is invalid.',
      userNotFound: 'Baka, that user doesn\'t exist.',
      updated: (username: string, mode: string) =>
        `Got that. Your current username is \`${username}\`, and your current mode is \`${mode}\`.`,
      sameAsBefore: 'That\'s the same thing you did before, though.'
    },
    timestampChannel: {
      name: 'add_timestamp_channel',
      description: 'add a channel for detecting osu! editor timestamps',
      noPermission: "Baka, you don't have the **Manage Channels** permission. You can't edit this setting.",
      botNoViewPermission: "Baka, I can't see that channel. Enable **View Channel** in permissions view, please.",
      botNoSendPermission: "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please.",
      internalError: "My sensei messed up. They're notified, please do this again tomorrow.\n\nSorry for the inconvenience.",
      alreadyExists: (channelId: string) => `The channel <#${channelId}> is already in the list of timestamp channels.`,
      added: (channelId: string) => `Added <#${channelId}> to the list of timestamp channels.`
    },
    trackLicense: {
      name: 'track-license',
      description: 'get licensing information for a Spotify track. Not reliable, use along with /osu verify-artist.',
      apiError: 'O-oh, something didn\'t click. My database is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
      trackError: (message: string) => `Error fetching track: ${message || 'Unknown error'}`,
      albumError: (message: string) => `Error fetching album: ${message || 'Unknown error'}`,
      unknown: "Unknown",
      inferredLicensePublicDomain: "No rights reserved (Public Domain)",
      inferredLicenseCreativeCommons: "Creative Commons (CC)",
      inferredLicenseAllRightsReserved: "All rights reserved",
      inferredLicenseNote: "*Note: License inference may not be accurate.*",
      embed: {
        artistField: "Artist",
        albumField: "Album",
        labelField: "Label",
        copyrightField: "Copyright",
        inferredLicenseField: "Inferred License"
      }
    },
    verifyArtist: {
      name: "verify-artist",
      description: "check this artist's policies before using their songs",
      notFound: (name: string) =>
        `I couldn't find any artist with the name **${name}**. Please check the spelling and try again. If the artist exists and you know their permission status, tell my sensei. They'll be happy to add it!\n\nOtherwise, if you don't, your best bet is to contact the artist directly and ask for permission.`,
      status: {
        allowed: ":green_square: Allowed",
        mostlyAllowed: ":yellow_square: Mostly Allowed",
        mostlyDeclined: ":red_square: Mostly Declined",
        undetermined: ":question: Undetermined"
      },
      disclaimer: {
        initialText: (count: number) =>
          `- *This artist has **${count}** disclaimer(s).*\n- *If the disclaimer field only contains song names, it means you cannot specifically use that song in your maps.*\n`,
        noDisclaimer: "No disclaimer. You can use this artist's songs freely."
      },
      evidence: {
        noEvidence: "No evidence found.",
        evidenceText: (index: number, url: string) => `**\`${index + 1}.\`** [Click here.](${url})\n`
      },
      links: {
        noLinks: "No links found."
      },
      embed: {
        title: (name: string) => `${name}'s Policies`,
        fields: {
          links: "Links",
          status: "Status",
          daysSinceRequest: "Days since request",
          disclaimer: "Disclaimer",
          evidence: "Evidence"
        },
        footer: (dataSource: string) => `This data is from ${dataSource}`
      }
    }
  },
  utility: {
    name: 'utility',
    description: 'some utilities to search for things',
    avatar: {
      name: 'avatar',
      description: 'get the avatar of a user',
      quality: "Quality: ",
      author: (username: string) => `${username}'s Avatar`,
      requestedBy: (username: string) => `Requested by ${username}`,
      fetchError: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`."
    },
    banner: {
      name: "banner",
      description: "get the banner of a user",
      quality: "Quality: ",
      noBanner: "Oh. They don't have Nitro as a user, or the developer of the app hasn't configured a banner for that application.",
      author: (username: string) => `${username}'s Banner`,
      fetchError: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`
    },
    channel: {
      name: 'channel',
      description: 'get information about a channel',
      notFound: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      invalidType: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      infoField: (channelName: string) => `${channelName}${channelName.endsWith("s") ? "'" : "'s"} Information`,
      types: {
        text: 'Text Channel',
        voice: 'Voice Channel',
        category: 'Guild Category',
        news: 'News Channel',
        threads: 'Threads',
        stage: 'Stage Channel',
        dir: 'Guild Directory',
        forum: 'Guild Forum'
      },
      unknown: 'Unknown',
      info: {
        author: (name: string) => `${name}${name.endsWith("s") ? "'" : "'s"} Information`,
        position: 'Position',
        type: 'Type',
        created: 'Created',
        nsfw: 'NSFW?',
        slowmode: 'Slowmode',
        id: 'ID',
        yes: 'Yes',
        no: 'No',
        topic: 'Topic'
      },
      requestedBy: (username: string) => `Requested by ${username}`
    },
    github: {
      name: 'github',
      description: 'get information about a GitHub repository',
      repoNotFound: "Baka, that repo doesn't exist.",
      fetchError: "GitHub didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`,
      field: (res: {
        language: string | null;
        forks_count: number;
        open_issues: number;
        subscribers_count: number;
        stargazers_count: number;
        archived: boolean;
        disabled: boolean;
        fork: boolean;
      }, license: string, size: string, ctx: CommandContext) =>
        ctx.client.utils.string.keyValueField({
          "Language": res.language || "Unknown",
          "Forks": res.forks_count.toLocaleString(),
          "License": license,
          "Open Issues": res.open_issues.toLocaleString(),
          "Watchers": res.subscribers_count.toLocaleString(),
          "Stars": res.stargazers_count.toLocaleString(),
          "Size": size,
          "Archived?": res.archived ? "Yes" : "No",
          "Disabled?": res.disabled ? "Yes" : "No",
          "Forked?": res.fork ? "Yes" : "No"
        }, 30)
    },
    npm: {
      name: 'npm',
      description: 'search for an npm library',
      repoNotFound: "I couldn't find that in the records. Check if you made a typo, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      fetchError: "npm didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`,
      keyword: 'Keywords',
      maintainer: 'Maintainers',
      ver: 'Version',
      author: 'Author',
      modified: 'Modified',
      score: 'Score',
      none: 'None',
      registry: 'npm Registry'
    },
    screenshot: {
      name: 'screenshot',
      description: 'take a screenshot of a website',
      urlError: "Baka, that's not a valid URL.\n\nMake sure it starts with either `https://` or `http://`.",
      noNsfw: "Hey, hey! That's a NSFW website, you moron! Be more cultured!\n\nOr just get into a NSFW channel.",
      requestedBy: (username: string) => `Requested by ${username}`,
      fetchError: "I'm fixing my web browser, hang tight! Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`."
    },
    server: {
      name: 'server',
      description: 'get information about the server',
      notFound: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      fetchError: "Discord didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`,
      general: 'General Info',
      channel: 'Channels Info',
      generalInfo: {
        author: (name: string) => `${name}${name.endsWith("s") ? "'" : "'s"} Information`,
        owner: "Owner",
        roleCount: "Role Count",
        emojiCount: "Emoji Count",
        created: "Created",
        boosts: "Boosts",
        mainLocale: "Main Locale",
        verification: "Verification",
        filter: "Filter"
      },
      channelInfo: {
        categories: "Categories",
        textChannels: "Text Channels",
        voiceChannels: "Voice Channels",
        newsChannels: "News Channels",
        afkChannel: "AFK Channel"
      },
      noAfkChannel: "None",
      noDescription: "Server has no description."
    },
    urban: {
      name: "urban",
      description: "search for a definition on Urban Dictionary",
      noDefinition: "No definition found for your query on Urban Dictionary. Did you typo? Try again!\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      profaneQuery: "If you're telling me to go search for NSFW terms, at least do that in a NSFW channel, you baka!",
      fetchError: "Urban Dictionary didn't let me do that. Try again in a little, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`
    },
    wiki: {
      name: 'wiki',
      description: 'search for information on Wikipedia',
      profaneQuery: "If you're telling me to go search for NSFW terms, at least do that in a NSFW channel, you baka!",
      notFound: "Can't find that. Did you typo? Try again!\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      fetchError: "Wikipedia didn't let me do that. Try again in a little bit, maybe?\n\nIf it still doesn't work, my sensei is probably using outdated method. Tell them with `/my fault`.",
      requestedBy: (username: string) => `Requested by ${username}`,
      desc: 'Description',
      extract: 'Extract',
      none: 'None'
    }
  },
  verify: {
    name: 'verify',
    description: 'osu! account verification system',
    customize: {
      name: "customize",
      description: "customize the verification message",
      editVerification: {
        title: "Edit Verification Message",
        fields: {
          title: "Title",
          description: "Description",
          thumbnail: "Thumbnail URL",
          color: "Embed Color (Hex Code)"
        },
        previewUpdated: "Preview updated. You can make more changes or save the configuration."
      },
      saveVerification: {
        noChannelSelected: "Please select a channel for the verification message.",
        channelNotFound: "Selected channel not found. Please try again.",
        messageSaved: "Verification message saved and posted in the selected channel.\n\nPlease **DO NOT** delete the verification message. You'll have to set it up again."
      },
      roleSelection: {
        placeholder: "Select verification role",
        roleNotFound: "Selected role not found. Please try again.",
        roleTooHigh: "Baka, that role is higher than my highest role. I can't assign that to other users.",
        roleUpdated: "Verification role updated."
      },
      channelSelection: {
        placeholder: "Select verification channel",
        channelNotFound: "Selected channel not found. Please try again.",
        botNoSendPermission: "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please.",
        channelUpdated: "Verification channel updated."
      },
      preview: {
        content: "Preview of the verification message:",
        lastUpdated: (date: string) => `Last updated: ${date}`
      },
      buttons: {
        edit: "Edit",
        save: "Save",
        verify: "Verify"
      },
      errors: {
        verificationDisabled: "The verification system is disabled. Please enable it first."
      },
      embed: {
        defaultTitle: "Verify your osu! account",
        defaultDescription: "Click the button below to verify your osu! account and gain access to the server."
      }
    },
    status: {
      name: "status",
      description: "check the verification status for this server",
      current: (enabled: boolean) => `The verification system is currently ${enabled ? "enabled" : "disabled"}.`
    },
    toggle: {
      name: "toggle",
      description: "toggle the verification system for this server",
      enabled: "The verification system has been enabled.",
      disabled: "The verification system has been disabled."
    }
  },
  // ################### Events
  interactionCreate: {
    noDm: 'I can\'t do that in your DMs, baka. But maybe one day. Sensei told me he\'ll do it.',
    startVerif: (baseUrl: string, userId: string, guildId: string) => `Start your verification by clicking [here](${baseUrl}/login?id=${userId}&guildId=${guildId}).\n\n*You can opt-out from having your osu! profile statistics collected by me by doing* \`/my rights [to:save your osu! profile details] [should_be:False]\` ***before** starting to verify.*`
  },
  // ################### Utilities
  miscUtil: {
    clickOnTimestamp: '*Click on the timestamp to open in editor.*\n\n',
    httpError: 'I\'m fixing my dial-up! Hang tight, this is normal. Ask again a little later.',
    cantAnswer: 'Can\'t answer that one.',
    apiError: 'O-oh, something didn\'t click. My database is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.',
    rr: {
      noImOrRe: 'Hey. Make sure to include both a result screen image and a replay file (.osr).',
      noExtract: 'I couldn\'t extract enough info from the result screen. Is the image clear? Make sure to have a replayer name!',
      yep: 'Yes, that\'s right',
      nop: 'Nope',
      closest: (name: string) => `Closest match I found is **${name}**. Is that correct?`,
      unknown: 'Unknown',
      matched: (slot: string, round: string, replayer: string) => `Replay matched to **${slot}** of **${round}** by **${replayer}**.`,
      closestMatched: (closest: string) => `Matched to **${closest}**.`,
      reject: 'Alright. Make sure to submit a clearer screenshot, or you can manually ask the host to add it.',
      noRes: 'Didn\'t receive any response. Do it again if you quite needed the time!',
      err: 'O-oh, something didn\'t click. The service is probably dead. Wait a little, then try again.\n\nIf nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`.'
    }
  },
  aniSchedule: {
    episodeUp: (episode: number, title: string, siteUrl: string) =>
      `You baka, episode **${episode}** of **[${title}](${siteUrl})** is up`,
    finalEpisode: " **(it's the final episode)** ",
    watch: (links: string) => `\n\nWatch: ${links}`,
    noWatch: "\n\nWatch: *None yet*",
    visit: (links: string) => `\n\nVisit: ${links}`,
    noVisit: "\n\nVisit: *None yet*",
    delayNotice: "\n\nIt may take some time to appear on the above service(s).",
    randomRemarks: [
      "Not like I wanted to remind you or something.",
      "Sensei made me DM you. I didn't want to do that.",
      "Alright, me back to my routine.",
      "Whether you knew this or not is irrelevant. It is my job.",
      "Also, have you seen my sensei?",
      "Didn't expect to meet me, did you."
    ],
    embed: {
      footer: {
        format: `Format: `,
        duration: (duration: number) => `Duration: ${duration} minutes`,
        studio: `Studio: `,
        unknown: 'Unknown'
      }
    }
  }
}