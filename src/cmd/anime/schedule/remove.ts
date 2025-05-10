import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  SubCommand,
  Group
} from "seyfert";

@Declare({
  name: 'remove',
  description: 'remove your current anime subscription'
})
@Group('schedule')
export default class Remove extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply();

    try {
      // Get user schedule
      const schedule = await ctx.interaction.user.getSchedule();

      // Check if user has a schedule
      if (!schedule?.anilistId) {
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

      // Update user's schedule (reset)
      await ctx.interaction.user.setSchedule({ anilistId: 0, nextEp: 0 });

      // Send response
      await ctx.editOrReply({
        content: `Stopped tracking airing episodes for **${media.title.romaji}**.`
      });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "There was an error removing your subscription. Try again later."
      });
    }
  }
}