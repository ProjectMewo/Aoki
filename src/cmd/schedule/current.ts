import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";
import { WatchingData } from "../../types/anilist";

export default class Current extends Subcommand {
  constructor() {
    super({
      name: 'current',
      description: 'get information about your currently subscribed anime',
      options: [],
      permissions: []
    });
  };
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    try {
      // Get user schedule
      const schedule = await i.user.getSchedule();
      
      // Check if user has a schedule
      if (!schedule) {
        return AokiError.USER_INPUT({
          sender: i,
          content: "Baka, you have no anime subscription."
        });
      }
      
      // Import required GraphQL query
      const { Watching } = await import("../../assets/graphql");
      
      // Get watching data from AniList
      const watchingData = await i.client.utils.anilist.fetch(Watching, {
        watched: [schedule.anilistId],
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
      
      // Format the response
      const title = `[${media.title.romaji}](${media.siteUrl})`;
      const nextEpisode = media.nextAiringEpisode?.episode;
      const timeUntilAiring = Math.round(media.nextAiringEpisode?.timeUntilAiring! / 3600) || "Unknown";
      
      // Send response
      await i.editReply({ 
        content: `You are currently watching **${title}**. Its next episode is **${nextEpisode}**, airing in about **${timeUntilAiring} hours**.` 
      });
    } catch (error) {
      console.log(error);
      return AokiError.API_ERROR({
        sender: i,
        content: "There was an error retrieving your subscription. Try again later."
      });
    }
  };
}