import AokiError from "@struct/AokiError";
import {
  CommandContext,
  Declare,
  SubCommand,
  Group,
  Locales
} from "seyfert";
import { Watching } from "@assets/graphql";
import { meta } from "@assets/cmdMeta";

@Declare({
  name: 'remove',
  description: 'remove your current anime subscription'
})
@Locales(meta.anime.schedule.remove.loc)
@Group('schedule')
export default class Remove extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.scheduleSub.remove;
    await ctx.deferReply();

    try {
      // Get user schedule
      const schedule = await ctx.interaction.user.getSchedule();

      // Check if user has a schedule
      if (!schedule?.anilistId) {
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

      // Update user's schedule (reset)
      await ctx.interaction.user.setSchedule({ anilistId: 0, nextEp: 0 });

      // Send response
      await ctx.editOrReply({
        content: t.response(media.title.romaji)
      });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.apiError
      });
    }
  }
}