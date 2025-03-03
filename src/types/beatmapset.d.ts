// https://github.com/cyperdark/osu-api-extended/blob/master/types/v2/beatmaps_details_set.ts
export interface Beatmapset {
  /**
   * The artist of the set
   */
  artist: string
  /**
   * The artist of the set in unicode
   */
  artist_unicode: string
  /**
   * The cover of the set
   */
  covers: Covers
  /**
   * The mapper (host) of the set
   */
  creator: string
  /**
   * The heart count of the set
   */
  favourite_count: number
  /**
   * The hype count of the set
   */
  hype: null
  /**
   * The ID of the set
   */
  id: number
  /**
   * Whether the set is not safe for work or not
   */
  nsfw: boolean
  /**
   * The online offset of the set
   */
  offset: number
  /**
   * The play count of the set
   */
  play_count: number
  /**
   * The preview point URL of the set
   */
  preview_url: string
  /**
   * The source of the song mapped
   */
  source: string
  /**
   * Whether the map is featured in spotlight or not
   */
  spotlight: boolean
  /**
   * The status of the set
   */
  status: string
  /**
   * The title of the set
   */
  title: string
  /**
   * The title of the set in unicode
   */
  title_unicode: string
  /**
   * The track ID of the set
   * If this field is available, that means the song is osu! copyrighted content
   */
  track_id: null
  /**
   * The mapper's ID
   */
  user_id: number
  /**
   * Whether the set has video available or not
   */
  video: boolean
  /**
   * The main BPM of the set
   */
  bpm: number
  /**
   * Whether the set can be hyped or not
   * If this is available, the set is likely pending or WIP
   */
  can_be_hyped: boolean
  /**
   * The timestamp of the set's deletion
   */
  deleted_at: null
  /**
   * Whether discussion is allowed or not
   */
  discussion_enabled: boolean
  /**
   * Whether the discussion is locked or not
   */
  discussion_locked: boolean
  /**
   * Whether a player can set a score on it or not
   */
  is_scoreable: boolean
  /**
   * The last update timestamp of the set
   */
  last_updated: string
  /**
   * The legacy thread URL of the set
   */
  legacy_thread_url: string
  /**
   * The summary of the nominations
   */
  nominations_summary: NominationsSummary
  /**
   * The ranked status of the set
   */
  ranked: number
  /**
   * The timestamp of the ranked date
   */
  ranked_date: string
  /**
   * The storyboard availability of the set
   */
  storyboard: boolean
  /**
   * The submitted date of the set
   */
  submitted_date: string
  /**
   * The tags of the set
   */
  tags: string
  /**
   * The availability of the set
   */
  availability: Availability
  /**
   * The beatmaps of the set
   */
  beatmaps: Beatmap[]
  /**
   * The converted beatmaps of the set
   * Only available with standard maps
   */
  converts: Convert[]
  /**
   * The current nominations of the set
   */
  current_nominations: CurrentNomination[]
  /**
   * The description of the set
   */
  description: Description
  /**
   * The genre of the set
   */
  genre: Genre
  /**
   * The language of the set
   */
  language: Genre
  /**
   * The pack tags of the set
   */
  pack_tags: string[]
  /**
   * The ratings of the set
   */
  ratings: number[]
  /**
   * The recent favourites of the set
   */
  recent_favourites: RelatedUser[]
  /**
   * The related users of the set
   */
  related_users: RelatedUser[]
  /**
   * The related tags of the set
   */
  related_tags: any[]
  /**
   * The user of the set
   */
  user: RelatedUser
}

export interface RelatedUser {
  avatar_url: string
  country_code: string
  default_group: string
  id: number
  is_active: boolean
  is_bot: boolean
  is_deleted: boolean
  is_online: boolean
  is_supporter: boolean
  last_visit: null | string
  pm_friends_only: boolean
  profile_colour: null | string
  username: string
}

export interface Genre {
  id: number
  name: string
}

export interface Description {
  description: string
}

export interface CurrentNomination {
  beatmapset_id: number
  rulesets: string[]
  reset: boolean
  user_id: number
}

export interface Convert {
  beatmapset_id: number
  difficulty_rating: number
  id: number
  mode: string
  status: string
  total_length: number
  user_id: number
  version: string
  accuracy: number
  ar: number
  bpm: number
  convert: boolean
  count_circles: number
  count_sliders: number
  count_spinners: number
  cs: number
  deleted_at: null
  drain: number
  hit_length: number
  is_scoreable: boolean
  last_updated: string
  mode_int: number
  passcount: number
  playcount: number
  ranked: number
  url: string
  checksum: string
  failtimes: Failtimes
  owners: Owner[]
}

export interface Beatmap {
  beatmapset_id: number
  difficulty_rating: number
  id: number
  mode: string
  status: string
  total_length: number
  user_id: number
  version: string
  accuracy: number
  ar: number
  bpm: number
  convert: boolean
  count_circles: number
  count_sliders: number
  count_spinners: number
  cs: number
  deleted_at: null
  drain: number
  hit_length: number
  is_scoreable: boolean
  last_updated: string
  mode_int: number
  passcount: number
  playcount: number
  ranked: number
  url: string
  checksum: string
  failtimes: Failtimes
  max_combo: number
  owners: Owner[]
  top_tag_ids: any[]
}

export interface Owner {
  id: number
  username: string
}

export interface Failtimes {
  fail: number[]
  exit: number[]
}

export interface Availability {
  download_disabled: boolean
  more_information: null
}

export interface NominationsSummary {
  current: number
  eligible_main_rulesets: string[]
  required_meta: RequiredMeta
}

export interface RequiredMeta {
  main_ruleset: number
  non_main_ruleset: number
}

export interface Covers {
  cover: string
  'cover@2x': string
  card: string
  'card@2x': string
  list: string
  'list@2x': string
  slimcover: string
  'slimcover@2x': string
}