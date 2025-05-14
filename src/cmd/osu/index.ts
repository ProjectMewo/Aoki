import { Declare, Command, Options, GroupsT } from "seyfert";
// Normal commands
import Beatmap from "./beatmap";
import CountryLeaderboard from "./country-leaderboard";
import TimestampChannel from "./timestamp-channel";
import TrackLicense from "./track-license";
import VerifyArtist from "./verify-artist";
import Profile from "./profile";
import Set from "./set";
// Mappool commands
import Approve from "./mappool/approve";
import Replays from "./mappool/replays";
import Suggest from "./mappool/suggest";
import View from "./mappool/view";
import ViewSuggestions from "./mappool/view-suggestions";
// Tourney commands
import AddRole from "./tourney/add-role";
import AddRound from "./tourney/add-round";
import Current from "./tourney/current";
import Delete from "./tourney/delete";
import Make from "./tourney/make";
import SetReplayChannel from "./tourney/set-replay-channel";

@Declare({
  name: 'osu',
  description: 'the bizzare game that you react to everything on the screen'
})
@GroupsT({
  mappool: {
    name: 'osu.mappool.name',
    defaultDescription: 'osu.mappool.description'
  },
  tourney: {
    name: 'osu.tourney.name',
    defaultDescription: 'osu.tourney.description'
  }
})
@Options([
  // normal commands           mappool commands          tourney commands
  Beatmap,                     Approve,                  AddRole,
  CountryLeaderboard,          Replays,                  AddRound,
  TimestampChannel,            Suggest,                  Current,
  TrackLicense,                View,                     Delete,
  VerifyArtist,                ViewSuggestions,          Make,
  Profile,                                               SetReplayChannel,
  Set
])
export default class OsuGame extends Command {};
