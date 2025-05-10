import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  Group, 
  SubCommand 
} from "seyfert";

@Declare({
  name: 'current',
  description: 'get information about your currently subscribed anime'
})
@Group('schedule')
export default class Current extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    try {
      // Get user schedule
      const schedule = await ctx.author.getSchedule();

      // Check if user has a schedule
      if (!schedule) {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: "Baka, you have no anime subscription."
        });
      }

      // Import required GraphQL query
      const { Watching } = await import("@assets/graphql");

      // Get watching data from AniList
      const watchingData = await ctx.client.utils.anilist.fetch(Watching, {
        watched: [schedule.anilistId],
        page: 0
      });

      // Handle errors or missing data
      if (!watchingData || !watchingData.Page.media[0]) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }

      // Get the media data
      const media = watchingData.Page.media[0];

      // Format the response
      const title = `[${media.title.romaji}](${media.siteUrl})`;
      const nextEpisode = media.nextAiringEpisode?.episode;
      const timeUntilAiring = Math.round(media.nextAiringEpisode?.timeUntilAiring! / 3600) || "Unknown";

      // Send response
      await ctx.editOrReply({ 
        content: `You are currently watching **${title}**. Its next episode is **${nextEpisode}**, airing in about **${timeUntilAiring} hours**.` 
      });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "There was an error retrieving your subscription. Try again later."
      });
    }
  }
}