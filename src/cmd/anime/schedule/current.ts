import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  Group, 
  Locales, 
  SubCommand 
} from "seyfert";
import { Watching } from "@assets/graphql";
import { meta } from "@assets/cmdMeta";

@Declare({
  name: 'current',
  description: 'get information about your currently subscribed anime'
})
@Locales(meta.anime.schedule.current.loc)
@Group('schedule')
export default class Current extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.scheduleSub.current;
    await ctx.deferReply();

    try {
      // Get user schedule
      const schedule = await ctx.author.getSchedule();

      // Check if user has a schedule
      if (!schedule) {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: t.noSub
        });
      }

      // Get watching data from AniList
      const watchingData = await ctx.client.utils.anilist.fetch(Watching, {
        watched: [schedule.anilistId],
        page: 0
      });

      // Handle errors or missing data
      if (!watchingData || !watchingData.Page.media[0]) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: t.notFound
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
        content: t.response(title, nextEpisode, timeUntilAiring)
      });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}