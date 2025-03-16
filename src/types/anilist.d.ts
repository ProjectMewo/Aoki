// manual types for anilist api
// as we use the api directly there's no set types we can use
// therefore we write one for use
// ----------------------------------------------------

// types for the portion of Anilist API we use

// AirDate queries
export type AirDateNoQueryData = AirDateNoQueryResponse;
export type AirDateQueryData = AirDateQueryResponse;

// User query
export type UserData = UserResponse;

// Watching query
export type WatchingData = WatchingQueryResponse;

// ----------------------------------------------------
export interface AirDateTitle {
  romaji: string;
  english?: string;
  native?: string;
}

export interface AirDateNextAiringEpisode {
  episode: number;
  timeUntilAiring: number;
}

export interface AirDateCoverImage {
  large: string;
  color?: string;
}

export interface AirDateStudioNode {
  name: string;
  siteUrl: string;
}

export interface AirDateStudioEdge {
  isMain: boolean;
  node: AirDateStudioNode;
}

export interface AirDateMedia {
  title: AirDateTitle;
  episodes: number;
  nextAiringEpisode?: AirDateNextAiringEpisode;
  id: number;
  siteUrl: string;
  coverImage: AirDateCoverImage;
  studios: {
    edges: AirDateStudioEdge[];
  };
}

export interface AirDateNoQueryResponse {
  errors?: Array<{ status: number }>;
  Page: {
    media: AirDateMedia[];
  };
}

export interface AirDateQueryResponse {
  errors?: Array<{ status: number }>;
  Media: AirDateMedia;
}

// user query types
export interface UserAvatar {
  large: string;
  medium: string;
}

export interface UserOptions {
  profileColor: string;
}

export interface FavouritesTitle {
  userPreferred: string;
  siteUrl: string;
}

export interface FavouritesAnimeEdge {
  node: {
    title: FavouritesTitle;
  };
}

export interface FavouritesMangaEdge {
  node: {
    title: FavouritesTitle;
  };
}

export interface FavouritesCharacterEdge {
  node: {
    name: {
      full: string;
    };
    siteUrl: string;
  };
}

export interface FavouritesStaffEdge {
  node: {
    name: {
      full: string;
    };
    siteUrl: string;
  };
}

export interface FavouritesStudioEdge {
  node: {
    name: string;
    siteUrl: string;
  };
}

export interface Favourites {
  anime: { edges: FavouritesAnimeEdge[] };
  manga: { edges: FavouritesMangaEdge[] };
  characters: { edges: FavouritesCharacterEdge[] };
  staff: { edges: FavouritesStaffEdge[] };
  studios: { edges: FavouritesStudioEdge[] };
}

export interface UserResponse {
  errors?: Array<{ status: number }>;
  User: {
    name: string;
    about?: string;
    avatar: UserAvatar;
    bannerImage?: string;
    options: UserOptions;
    siteUrl: string;
    favourites: Favourites;
  };
}

// watching query types
export interface WatchingPageInfo {
  currentPage: number;
  hasNextPage: boolean;
}

export interface WatchingMediaTitle {
  romaji: string;
}

export interface WatchingNextAiringEpisode {
  episode: number;
  timeUntilAiring: number;
}

export interface WatchingMedia {
  errors: Array<{ status: number }>;
  status: string;
  siteUrl: string;
  id: number;
  title: WatchingMediaTitle;
  nextAiringEpisode?: WatchingNextAiringEpisode;
}

export interface WatchingQueryResponse {
  errors?: Array<{ status: number }>;
  Page: {
    pageInfo: WatchingPageInfo;
    media: WatchingMedia[];
  };
}