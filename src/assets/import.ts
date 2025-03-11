// all commands and their options
// constructed in only one file for maintenance
// so when I have to check on a command I won't have to scroll 100 lines of code
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

const fun = new SlashCommandBuilder()
  .setName("fun")
  .setDescription("long list of subcommands for... fun.")
  .addSubcommand(cmd => cmd
    .setName("8ball")
    .setDescription("ask me anything.")
    .addStringOption(option => option.setName("query").setDescription("just.. ask me.").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName('fact')
    .setDescription("gives you a random fact. Mostly useless though.")
  )
  .addSubcommand(cmd => cmd
    .setName("owo")
    .setDescription("owoify your message")
    .addStringOption(option => option
      .setName("query")
      .setDescription("the text you wanna owoify")
      .setRequired(true)
      .setMaxLength(200)
    )
  )
  .addSubcommand(cmd => cmd
    .setName('today')
    .setDescription("gives you a random fact of today, in the past.")
  )
  .addSubcommand(cmd => cmd
    .setName('ship')
    .setDescription("ships 2 people you mention, with 5% faith in the lucky wheel.")
    .addUserOption(option => option.setName("first").setDescription("...literally the first person.").setRequired(true))
    .addUserOption(option => option.setName("second").setDescription("...literally the second person, duh!").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName('fortune')
    .setDescription("gives you a random fortune cookie's paper.")
  )
  .addSubcommand(cmd => cmd
    .setName('advice')
    .setDescription("gives you a random advice.")
  )
  .addSubcommand(cmd => cmd
    .setName('affirmation')
    .setDescription("gives you a random affirmation.")
  )
  .addSubcommand(cmd => cmd
    .setName('truth')
    .setDescription("gives you a random truth question, from the ol' truth or dare game.")
  )
  .addSubcommand(cmd => cmd
    .setName('generator')
    .setDescription('meme generator, yes, you can now make them in Discord.')
    .addStringOption(option => option
      .setName('template')
      .setDescription('meme template you wanna use')
      .addChoices(...[
        { name: "Drake Hotline Bling", value: '181913649' },
        { name: "Distracted Boyfriend", value: '112126428' },
        { name: "One Does Not Simply", value: '61579' },
        { name: "Ancient Aliens", value: '101470' },
        { name: "Tuxedo Winnie The Pooh", value: '222403160' },
        { name: "Leonardo Dicaprio Cheers", value: '217743513' },
        { name: "Always Has Been", value: '155121' },
        { name: "Doge", value: '8072285' },
        { name: "Third World Skeptical Kid", value: '101288' },
        { name: "Y U NO", value: '61585' },
        { name: "Success Kid", value: '61544' },
        { name: "Grumpy Cat", value: '405658' },
        { name: "Expanding Brain", value: '93895088' },
        { name: "Is This a Pigeon?", value: '100947' },
        { name: "Roll Safe", value: '89370399' },
        { name: "Surprised Pikachu", value: '155067736' },
        { name: "Mocking SpongeBob", value: '102156234' },
        { name: "Batman Slapping Robin", value: '438680' },
        { name: "Bernie I Am Once Again Asking", value: '91545188' },
        { name: "Facepalm", value: '61527' }
      ])
      .setRequired(true)
    )
    .addStringOption(option => option.setName('top').setDescription('first text field (or top text)').setRequired(true))
    .addStringOption(option => option.setName("bottom").setDescription("second text field (or bottom text)").setRequired(true))
  )

const util = new SlashCommandBuilder()
  .setName("utility")
  .setDescription("the name says it all.")
  .addSubcommand(cmd => cmd
    .setName("avatar")
    .setDescription("display one's avatar.")
    .addUserOption(option => option.setName("user").setDescription("user to check their avatar."))
  )
  .addSubcommand(cmd => cmd
    .setName("banner")
    .setDescription("display one's banner.")
    .addUserOption(option => option.setName("user").setDescription("user to check their banner."))
  )
  .addSubcommand(cmd => cmd
    .setName("channel")
    .setDescription("display a channel's information.")
    .addChannelOption(option => option.setName("channel").setDescription("...just the server channel."))
  )
  .addSubcommand(cmd => cmd
    .setName("github")
    .setDescription("display a (public) GitHub repo's information.")
    .addStringOption(option => option.setName("user").setDescription("the owner of the repository.").setRequired(true))
    .addStringOption(option => option.setName("repo").setDescription("the name of the repository.").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName("npm")
    .setDescription("display an npm package's information.")
    .addStringOption(option => option.setName("query").setDescription("...just the package's name.").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName("server")
    .setDescription("display this server's information.")
  )
  .addSubcommand(cmd => cmd
    .setName("urban")
    .setDescription("the one dictionary you love.")
    .addStringOption(option => option.setName("query").setDescription("...just the word you want to define.").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName("screenshot")
    .setDescription("screenshot a webpage.")
    .addStringOption(option => option.setName("query").setDescription("the URL of the webpage").setRequired(true))
  )
  .addSubcommand(cmd => cmd
    .setName("wiki")
    .setDescription("the one encyclopedia you love.")
    .addStringOption(option => option.setName("query").setDescription("...just the definition you want to search for.").setRequired(true))
  )

const my = new SlashCommandBuilder()
  .setName("my")
  .setDescription("personal commands.")
  .addSubcommand(cmd => cmd
    .setName("ping")
    .setDescription("check if I'm alive")
  )
  .addSubcommand(cmd => cmd
    .setName("stats")
    .setDescription("my raw system stats about various things")
  )
  .addSubcommand(cmd => cmd
    .setName("rights")
    .setDescription("can I access this data?")
    .addStringOption(option => option
      .setName("to")
      .setDescription("the permission name")
      .addChoices(...[
        { name: "read & process your messages", value: "processmessagepermission" },
        { name: "count your messages for leveling", value: "countmessagetolevel" }
      ])
      .setRequired(true)
    )
    .addBooleanOption(option => option
      .setName("should_be")
      .setDescription("can I?")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("eval")
    .setDescription("evaluates code. Only my sensei can use this.")
    .addStringOption(option => option
      .setName("query")
      .setDescription("the code you wanna evaluate")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("fault")
    .setDescription("found a bug? tell me here.")
    .addStringOption(option => option
      .setName("query")
      .setDescription("issue description, if needed.")
    )
    .addAttachmentOption(option => option
      .setName("attachment")
      .setDescription("an image for the issue, if needed.")
    )
  )
  .addSubcommand(cmd => cmd
    .setName("info")
    .setDescription("curious about me? check here.")
  )
  .addSubcommand(cmd => cmd
    .setName("vote")
    .setDescription("vote for me on top.gg!")
  );

const anime = new SlashCommandBuilder()
  .setName("anime")
  .setDescription("I'm also someone fictional... you know, but not like I wanted to talk to you about it!")
  .addSubcommand(cmd => cmd
    .setName("profile")
    .setDescription("finds someone's profile on either MyAnimeList or AniList")
    .addStringOption(option => option
      .setName("platform")
      .setDescription("the platform you want to search for")
      .addChoices(...[
        { name: "AniList", value: "al" },
        { name: "MyAnimeList", value: "mal" }
      ])
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("query")
      .setDescription("the profile username to search for")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("search")
    .setDescription("finds an anime, a manga, a character, or a seiyuu")
    .addStringOption(option => option
      .setName("type")
      .setDescription("whether to search for an anime, a manga, a character, or a seiyuu")
      .addChoices(...[
        { name: "anime", value: "anime" },
        { name: "manga", value: "manga" },
        { name: "character", value: "characters" },
        { name: "people", value: "people" }
      ])
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("query")
      .setDescription("the name to search for")
      .setAutocomplete(true)
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("airing")
    .setDescription("see what's airing on a given weekday.")
    .addStringOption(option => option
      .setName("query")
      .setDescription("what weekday to check for?")
      .setRequired(true)
      .addChoices(...[
        { name: "Monday", value: "Monday" },
        { name: "Tuesday", value: "Tuesday" },
        { name: "Wednesday", value: "Wednesday" },
        { name: "Thursday", value: "Thursday" },
        { name: "Friday", value: "Friday" },
        { name: "Saturday", value: "Saturday" },
        { name: "Sunday", value: "Sunday" }
      ])
    )
  )
  .addSubcommand(cmd => cmd
    .setName("quote")
    .setDescription("anime quotes, best stuff ever.")
  )
  .addSubcommand(cmd => cmd
    .setName("action")
    .setDescription("spams you with images where anime characters do stuff")
    .addStringOption(option => option
      .setName("query")
      .setDescription("the thing that you want to be spammed with")
      .setRequired(true)
      .addChoices(...[
        { name: 'bully', value: 'bully' }, { name: 'cry', value: 'cry' },
        { name: 'awoo', value: 'awoo' }, { name: 'bonk', value: 'bonk' },
        { name: 'yeet', value: 'yeet' }, { name: 'hug', value: 'hug' },
        { name: 'lick', value: 'lick' }, { name: 'neko', value: 'neko' },
        { name: 'pat', value: 'pat' }, { name: 'blush', value: 'blush' },
        { name: 'slap', value: 'slap' }, { name: 'wave', value: 'wave' },
        { name: 'smile', value: 'smile' }, { name: 'smug', value: 'smug' },
        { name: 'highfive', value: 'highfive' }, { name: 'wink', value: 'wink' },
        { name: 'handhold', value: 'handhold' }, { name: "nom", value: "nom" },
        { name: 'bite', value: 'bite' }, { name: "glomp", value: "glomp" },
        { name: "kick", value: "kick" }, { name: 'happy', value: 'happy' },
        { name: "poke", value: "poke" }, { name: 'dance', value: 'dance' },
        { name: "cringe", value: "cringe" }
      ])
    )
  )
  .addSubcommand(cmd => cmd
    .setName("random")
    .setDescription("gets a random anime or manga info")
    .addStringOption(option => option
      .setName("type")
      .setDescription("whether to get an anime or manga")
      .setRequired(true)
      .addChoices(...[
        { name: "anime", value: "anime" },
        { name: "manga", value: "manga" }
      ])
    )
  )
  .addSubcommandGroup(group => group
    .setName("schedule")
    .setDescription("I'm assigned this task to tell you when a new episode airs.")
    .addSubcommand(cmd => cmd
      .setName("current")
      .setDescription("check out your current watching anime.")
    )
    .addSubcommand(cmd => cmd
      .setName("add")
      .setDescription("add a new anime to your watchlist.")
      .addStringOption(option => option
        .setName("query")
        .setDescription("the name of the anime.")
        .setAutocomplete(true)
        .setRequired(true)
      )
    )
    .addSubcommand(cmd => cmd
      .setName("remove")
      .setDescription("remove your watchlist.")
    )
  )

const verify = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('set up osu! account verification for your server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(cmd => cmd
    .setName('toggle')
    .setDescription('enable or disable the verification feature')
  )
  .addSubcommand(cmd => cmd
    .setName('customize')
    .setDescription('customize the verification message, channel and role')
  )

const osugame = new SlashCommandBuilder()
  .setName("osu")
  .setDescription("the bizzare game that you react to whatever appears on the screen.")
  .addSubcommand(cmd => cmd
    .setName("set")
    .setDescription("sets your in-game name and main gamemode.")
    .addStringOption(option => option
      .setName("username")
      .setDescription("your in-game name")
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("mode")
      .setDescription("your main gamemode")
      .setRequired(true)
      .addChoices(...[
        { name: "standard", value: "osu" },
        { name: "taiko", value: "taiko" },
        { name: "catch", value: "fruits" },
        { name: "mania", value: "mania" }
      ])
    )
  )
  .addSubcommand(cmd => cmd
    .setName("profile")
    .setDescription("check out your in-game profile")
    .addStringOption(option => option.setName("username").setDescription("your in-game username. Not required if you have one saved"))
    .addStringOption(option => option
      .setName("mode")
      .setDescription("the mode you wish to check out. Not required if you have one saved")
      .addChoices(...[
        { name: "standard", value: "osu" },
        { name: "taiko", value: "taiko" },
        { name: "catch", value: "fruits" },
        { name: "mania", value: "mania" }
      ])
    )
  ).addSubcommand(cmd => cmd
    .setName("set_timestamp_channel")
    .setDescription("a channel where any osu! editor timestamp gets edited into clickable ones.")
    .addChannelOption(option => option
      .setName("channel")
      .setDescription("the channel to track")
      .setRequired(true)
    )
  )
  .addSubcommand(cmd => cmd
    .setName("beatmap")
    .setDescription("search for a beatmap.")
    .addStringOption(option => option
      .setName("query")
      .setDescription("search query.")
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName("mode")
      .setDescription("gamemode to seach for.")
      .addChoices(...[
        { name: "standard", value: "0" },
        { name: "taiko", value: "1" },
        { name: "catch", value: "2" },
        { name: "mania", value: "3" }
      ])
    )
    .addStringOption(option => option
      .setName("status")
      .setDescription("rank status")
      .addChoices(...[
        { name: "any", value: "any" },
        { name: "ranked", value: "ranked" },
        { name: "loved", value: "loved" },
        { name: "qualified", value: "qualified" },
        { name: "pending", value: "pending" },
        { name: "graveyard", value: "graveyard" }
      ])
    )
    .addStringOption(option => option
      .setName("sort")
      .setDescription("sorting mode")
      .addChoices(...[
        { name: "artist", value: "artist" },
        { name: "favorites", value: "favorites" },
        { name: "playcount", value: "playcount" },
        { name: "ranked date", value: "ranked_date" },
        { name: "rating", value: "rating" },
        { name: "relevance", value: "relevance" },
        { name: "stars", value: "stars" },
        { name: "title", value: "title" }
      ])
    )
    .addStringOption(option => option
      .setName("genre")
      .setDescription("genre of the map")
      .addChoices(...[
        { name: "any", value: "artist" },
        { name: "anime", value: "anime" },
        { name: "classical", value: "classical" },
        { name: "electronic", value: "stars" },
        { name: "folk", value: "folk" },
        { name: "hiphop", value: "hiphop" },
        { name: "jazz", value: "jazz" },
        { name: "metal", value: "metal" },
        { name: "novelty", value: "novelty" },
        { name: "pop", value: "pop" },
        { name: "rock", value: "rock" },
        { name: "video game", value: "video_game" },
        { name: "other", value: "other" },
        { name: "unspecified", value: "unspecified" }
      ])
    )
    .addStringOption(option => option
      .setName("language")
      .setDescription("language of the song")
      .addChoices(...[
        { name: "any", value: "artist" },
        { name: "chinese", value: "chinese" },
        { name: "english", value: "english" },
        { name: "french", value: "french" },
        { name: "german", value: "german" },
        { name: "italian", value: "italian" },
        { name: "japanese", value: "japanese" },
        { name: "korean", value: "korean" },
        { name: "polish", value: "polish" },
        { name: "russian", value: "russian" },
        { name: "spanish", value: "spanish" },
        { name: "swedish", value: "swedish" },
        { name: "instrumental", value: "instrumental" },
        { name: "other", value: "other" },
        { name: "unspecified", value: "unspecified" }
      ])
    )
    .addBooleanOption(option => option
      .setName("storyboard")
      .setDescription("whether the map should have a storyboard")
    )
  )
  .addSubcommand(cmd => cmd
    .setName('country_leaderboard')
    .setDescription('view the country leaderboard for a beatmap.')
    .addIntegerOption(option => option
      .setName('beatmap_id')
      .setDescription('the ID of the beatmap.')
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName('country_code')
      .setDescription('the 2-letter country code (e.g., US, JP).')
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName('mode')
      .setDescription('game mode for the leaderboard.')
      .setRequired(true)
      .addChoices(
        { name: 'osu', value: 'osu' },
        { name: 'taiko', value: 'taiko' },
        { name: 'catch', value: 'fruits' },
        { name: 'mania', value: 'mania' },
      )
    )
    .addStringOption(option => option
      .setName('sort')
      .setDescription('sort the leaderboard by a specific category.')
      .addChoices(
        { name: 'Performance', value: "performance" },
        { name: 'Accuracy', value: "accuracy" },
        { name: 'Combo', value: "combo" },
        { name: 'ScoreV3 (lazer)', value: "lazer_score" },
        { name: 'ScoreV1 (stable)', value: "stable_score" },
      )
    )
  );

export { fun, util, my, anime, osugame, verify };
