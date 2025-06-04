import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  Locales
} from "seyfert";
import { User } from "@assets/graphql";
import { UserData } from "@local-types/anilist";
import { meta } from "@assets/cmdMeta";

const options = {
  platform: createStringOption({
    description: "the platform to search on",
    description_localizations: meta.anime.profile.platform,
    required: true,
    choices: [
      { name: "MyAnimeList", value: "mal" },
      { name: "AniList", value: "al" }
    ]
  }),
  username: createStringOption({
    description: "the username to search for",
    description_localizations: meta.anime.profile.username,
    required: true
  })
};

@Declare({
  name: "profile",
  description: "get an anime profile from MyAnimeList or AniList"
})
@Locales(meta.anime.profile.loc)
@Options(options)
export default class Profile extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).anime.profile;
    const { platform, username } = ctx.options;

    await ctx.deferReply();

    const utils = ctx.client.utils;
    const jikan_v4 = "https://api.jikan.moe/v4";

    // Check for profanity
    if (await utils.profane.isProfane(username)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noNsfw
      });
    }

    try {
      if (platform === "mal") {
        const response = await fetch(`${jikan_v4}/users/${username}/full`);

        if (!response.ok) {
          return AokiError.NOT_FOUND({
            sender: ctx.interaction,
            content: t.notFound
          });
        }

        const data = await response.json();
        const result = data.data;

        if (!result) {
          return AokiError.NOT_FOUND({
            sender: ctx.interaction,
            content: t.notFound
          });
        }

        const spreadMap = (arr: Array<{ title?: string; name?: string; url: string }>) => {
          const res = utils.string.joinArrayAndLimit(
            arr.map((entry) => {
              return `[${entry[entry.title ? "title" : "name"]}](${entry.url
                .split("/")
                .splice(0, 5)
                .join("/")})`;
            }),
            1000,
            " • "
          );
          return res.text + (res.excess ? ` and ${res.excess} more!` : "") || "None Listed.";
        };

        const favorites = {
          anime: spreadMap(result.favorites.anime),
          manga: spreadMap(result.favorites.manga),
          chars: spreadMap(result.favorites.characters),
          people: spreadMap(result.favorites.people)
        };

        const cleanedAboutField = (result.about || "").replace(/(<([^>]+)>)/gi, "");
        const description = [
          utils.string.textTruncate(
            cleanedAboutField,
            350,
            `... *[read more here](${result.url})*`
          ),
          `• **Gender:** ${result.gender || "Unspecified"}`,
          `• **From:** ${result.location || "Unspecified"}`,
          `• **Joined:** ${utils.time.formatDate(new Date(result.joined), "dd MMMM yyyy")}`,
          `• **Last Seen:** ${utils.time.formatDate(new Date(result.last_online), "dd MMMM yyyy")}`
        ].join("\n");

        const embed = new Embed()
          .setColor(10800862)
          .setTimestamp()
          .setAuthor({
            name: `${result.username}'s Profile`,
            iconUrl: result.images.jpg.image_url
          })
          .setDescription(description)
          .addFields([
            { name: "Anime Stats", value: utils.string.keyValueField(result.statistics.anime), inline: true },
            { name: "Manga Stats", value: utils.string.keyValueField(result.statistics.manga), inline: true },
            { name: "Favourite Anime", value: favorites.anime },
            { name: "Favorite Manga", value: favorites.manga },
            { name: "Favorite Characters", value: favorites.chars },
            { name: "Favorite Staffs", value: favorites.people }
          ]);

        await ctx.editOrReply({ embeds: [embed] });
      } else {
        const userData = (await utils.anilist.fetch(User, { search: username })) as UserData;

        if (!userData || userData.errors) {
          if (userData?.errors?.some((code: { status: number }) => code.status >= 500)) {
            return AokiError.API_ERROR({
              sender: ctx.interaction,
              content: "The service is probably dead. Wait a little bit, then try again."
            });
          } else {
            return AokiError.NOT_FOUND({
              sender: ctx.interaction,
              content: t.notFound
            });
          }
        }

        const topFields = Object.entries(userData.User.favourites).map(
          ([query, target]: [
            string,
            {
              edges: Array<{
                node: {
                  title: string | { userPreferred: string; full: string };
                  name: string | { userPreferred: string; full: string };
                  siteUrl: string;
                };
              }>;
            }
          ]) => {
            const firstTarget =
              target.edges
                .map((entry) => {
                  const identifier = entry.node.title || entry.node.name;
                  const name =
                    typeof identifier === "object"
                      ? identifier.userPreferred || identifier.full
                      : identifier;
                  return `[**${name}**](${entry.node.siteUrl})`;
                })
                .join("|") || "None Listed";
            return `\n**Top 1 ${query}:** ` + firstTarget.split("|")[0];
          }
        );

        const description = userData.User.about
          ? utils.string.textTruncate(
              utils.string.heDecode(
                userData.User.about?.replace(/(<([^>]+)>)/g, "") || ""
              ),
              250
            )
          : "No description provided";

        const embed = new Embed()
          .setColor(10800862)
          .setTimestamp()
          .setImage(userData.User.bannerImage!)
          .setThumbnail(userData.User.avatar.medium)
          .setTitle(userData.User.name)
          .setURL(userData.User.siteUrl)
          .setFooter({
            text: `Requested by ${ctx.interaction.user.username}`,
            iconUrl: ctx.author.avatarURL()
          })
          .setDescription(`***About the user:** ${description}*` + `\n${topFields}`);

        await ctx.editOrReply({ embeds: [embed] });
      }
    } catch (error) {
      return AokiError.API_ERROR({
        sender: ctx.interaction,
        content: t.undocErr
      });
    }
  }
}