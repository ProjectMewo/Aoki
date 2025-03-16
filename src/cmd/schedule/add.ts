import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import { WatchingData } from "../../types/anilist";

export default class Add extends Subcommand {
  constructor() {
    super({
      name: 'add',
      description: 'subscribe to anime episode notifications',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'anime',
          description: 'the anime to subscribe to',
          required: true,
          isAutocomplete: true
        }
      ]
    });
  };
  
  async autocomplete(i: AutocompleteInteraction): Promise<void> {
    const focusedValue = i.options.getFocused().toString();
    const jikan_v4 = "https://api.jikan.moe/v4";
    
    if (!focusedValue) {
      return await i.respond([]);
    }
    
    try {
      // Search for anime using Jikan API
      const response = await fetch(`${jikan_v4}/anime?q=${focusedValue}`);
      
      if (!response.ok) {
        return await i.respond([]);
      }
      
      const res = await response.json();
      
      if (!res.data || res.data.length === 0) {
        return await i.respond([]);
      }
      
      // Filter and map results
      const results = res.data
        .filter((anime: any) => anime.title.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25)
        .map((anime: any) => ({
          name: anime.title,
          value: anime.mal_id.toString()
        }));
      
      await i.respond(results);
    } catch (error) {
      await i.respond([]);
    }
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    try {
      // Check if user already has a schedule
      const schedule = await i.user.getSchedule();
      
      if (schedule?.anilistId) {
        return AokiError.USER_INPUT({
          sender: i,
          content: "Baka, you can only have **one schedule** running at a time."
        });
      }
      
      // Get the anime ID from options
      const animeId = i.options.getString("anime")!;
      
      // Get AniList ID from MAL ID
      const anilistId = await i.client.utils.anilist.getMediaId(animeId);
      
      if (!anilistId) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }
      
      // Import required GraphQL query
      const { Watching } = await import("../../assets/graphql");
      
      // Get media data from AniList
      const watchingData = await i.client.utils.anilist.fetch(Watching, {
        watched: [anilistId],
        page: 0
      }) as WatchingData;
      
      // Handle errors or missing data
      if (!watchingData || !watchingData.Page.media[0]) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }
      
      // Check for API errors
      if (watchingData.errors) {
        if (watchingData.errors.some((code: any) => code.status >= 500)) {
          return AokiError.API_ERROR({
            sender: i,
            content: "The service is probably dead. Wait a little bit, then try again."
          });
        } else if (watchingData.errors.some((code: any) => code.status >= 400)) {
          return AokiError.NOT_FOUND({
            sender: i,
            content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
          });
        } else {
          return AokiError.API_ERROR({
            sender: i,
            content: "Wow, this kind of error has never been documented. Wait for about 5-10 minutes, if nothing changes after that, my sensei probably messed up. Try reporting this with `/my fault`."
          });
        }
      }
      
      // Get the media data
      const media = watchingData.Page.media[0];
      
      // Check if the anime is airing or upcoming
      if (!["NOT_YET_RELEASED", "RELEASING"].includes(media.status)) {
        return AokiError.USER_INPUT({
          sender: i,
          content: "Baka, that's not airing. It's not an upcoming one, too. Maybe even finished."
        });
      }
      
      // Update user's schedule
      await i.user.setSchedule({ 
        anilistId: media.id, 
        nextEp: media.nextAiringEpisode?.episode! 
      });
      
      // Format the response
      const title = media.title.romaji;
      const timeUntilAiring = Math.round(media.nextAiringEpisode?.timeUntilAiring! / 3600);
      
      // Send response
      await i.editReply({ 
        content: `Tracking airing episodes for **${title}**. Next episode is airing in about **${timeUntilAiring} hours**.` 
      });
    } catch (error) {
      return AokiError.API_ERROR({
        sender: i,
        content: "There was an error setting up your subscription. Try again later."
      });
    }
  };
}