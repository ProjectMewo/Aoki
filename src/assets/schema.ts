// Default schema for the database
// @typedef {Object} Schema
import { 
  GuildSettings,
  ScheduleData,
  UserSettings,
  VerificationSettings
} from "@local-types/settings";
import { ColorResolvable } from "seyfert/lib/common";

export default {
  users: {
    language: "en-US",
    inGameName: "",
    defaultMode: 0,
    processMessagePermission: true,
    saveOsuUserAccount: true
  } as UserSettings,

  schedules: {
    anilistId: 0,
    nextEp: 0
  } as ScheduleData,

  guilds: {
    timestampChannel: [],
    verification: {
      status: false,
      roleId: "",
      channelId: "",
      messageId: "",
      title: "",
      description: "",
      thumbnail: "",
      color: "" as ColorResolvable
    },
    tournament: {
      name: "",
      abbreviation: "",
      currentRound: "",
      mappools: [{
        round: "",
        slots: [],
        maps: [{
          slot: "",
          url: "",
          fullRecognizer: ""
        }],
        suggestions: [{
          slot: "",
          urls: []
        }],
        replays: [{
          slot: "",
          replayer: "",
          messageUrl: ""
        }],
        replayChannelId: ""
      }],
      roles: {
        host: [],
        advisor: [],
        mappooler: [],
        customMapper: [],
        testReplayer: []
      }
    }
  } as GuildSettings,

  verifications: {
    id: "",
    state: "",
    createdAt: "",
    guildId: ""
  } as VerificationSettings
};