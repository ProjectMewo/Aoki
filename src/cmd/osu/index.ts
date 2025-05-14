import Command from "@struct/handlers/Command";
import Set from "./set";
import Profile from "./profile";
import TimestampChannel from "./timestamp-channel";
import CountryLeaderboard from "./country-leaderboard";
import Beatmap from "./beatmap";
import VerifyArtist from "./verify-artist";
import TrackLicense from "./track-license";

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
        new VerifyArtist,
        new TrackLicense,
      ],
    })
  };
}