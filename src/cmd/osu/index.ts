import Command from "@struct/handlers/Command";
import Set from "./set";
import Profile from "./profile";
import TimestampChannel from "./timestamp-channel";
import CountryLeaderboard from "./country-leaderboard";
import Beatmap from "./beatmap";

export default class Osu extends Command {
  constructor() {
    super({
      name: 'osu',
      description: 'osu! related commands',
      cooldown: 0,
      subcommands: [
        new Set,
        new Profile,
        new TimestampChannel,
        new CountryLeaderboard,
        new Beatmap,
      ],
    })
  };
}