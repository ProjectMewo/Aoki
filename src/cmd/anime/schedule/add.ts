import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";

const options = {
  anime: createStringOption({
    description: 'the anime to subscribe to',
    required: true,
    autocomplete: async (interaction) => await Add.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: 'add',
  description: 'subscribe to anime episode notifications'
})
@Group('schedule')
@Options(options)
export default class Add extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getAutocompleteValue();
    const jikan_v4 = "https://api.jikan.moe/v4";

    if (!focusedValue) return interaction.respond([]);

    try {
      const response = await fetch(`${jikan_v4}/anime?q=${focusedValue}`);
      if (!response.ok) {
        return interaction.respond([]);
      }

      const res = await response.json();
      if (!Array.isArray(res.data) || res.data.length === 0) {
        return interaction.respond([]);
      }

      const results = res.data
        .filter((anime: { title: string }) => anime.title.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25)
        .map((anime: { title: string; mal_id: number }) => ({
          name: anime.title,
          value: anime.mal_id.toString()
        }));

      await interaction.respond(results);
    } catch (error) {
      console.error("Error fetching autocomplete data:", error);
      await interaction.respond([]);
    }
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const animeId = ctx.options.anime;
    const utils = ctx.client.utils;

    await ctx.deferReply();

    try {
      // Check if the bot can DM the user
      try {
        // Fetch the user first
        await ctx.client.users.fetch(ctx.author.id);
        // Then we send them a DM (open a new one)
        await ctx.client.users.write(ctx.author.id, {
          content: 'Just checking if I can send you messages. Ignore me here.'
        });
      } catch {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: "Baka, I can't send you DMs. Please enable DMs from server members and try again."
        });
      }

      // Check if user already has a schedule
      const schedule = await ctx.interaction.user.getSchedule();
      if (schedule?.anilistId) {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: "Baka, you can only have **one schedule** running at a time."
        });
      }

      // Get AniList ID from MAL ID
      const anilistId = await utils.anilist.getMediaId(animeId);
      if (!anilistId) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }

      // Import required GraphQL query
      const { Watching } = await import("@assets/graphql");

      // Get media data from AniList
      const watchingData = await utils.anilist.fetch(Watching, {
        watched: [anilistId],
        page: 0
      });

      if (!watchingData || !watchingData.Page.media[0]) {
        return AokiError.NOT_FOUND({
          sender: ctx.interaction,
          content: "Looks like I found nothing in the records.\n\nYou believe that should exist? My sensei probably messed up. Try reporting this with `/my fault`."
        });
      }

      const media = watchingData.Page.media[0];

      // Check if the anime is airing or upcoming
      if (!["NOT_YET_RELEASED", "RELEASING"].includes(media.status)) {
        return AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: "Baka, that's not airing. It's not an upcoming one, too. Maybe even finished."
        });
      }

      // Update user's schedule
      await ctx.interaction.user.setSchedule({
        anilistId: media.id,
        nextEp: media.nextAiringEpisode?.episode!
      });

      // Send the response
      const title = media.title.romaji;
      const timeUntilAiring = Math.round(media.nextAiringEpisode?.timeUntilAiring! / 3600);
      await ctx.editOrReply({
        content: `Tracking airing episodes for **${title}**. Next episode is airing in about **${timeUntilAiring} hours**.`
      });
    } catch {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: "There was an error setting up your subscription. Try again later."
      });
    }
  }
}