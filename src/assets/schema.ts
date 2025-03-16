// Default schema for the database
// @typedef {Object} Schema
export default {
  users: {
    inGameName: null,
    defaultMode: 0,
    processMessagePermission: true
  },
  schedules: {
    anilistId: null,
    nextEp: null
  },
  guilds: {
    timestampChannel: null,
    verification: {
      status: false,
      roleId: null,
      channelId: null,
      messageId: null,
      title: null,
      description: null,
      thumbnail: null,
      color: null
    },
  },
  verifications: {
    id: null,
    state: null,
    createdAt: null,
    guildId: null
  }
};