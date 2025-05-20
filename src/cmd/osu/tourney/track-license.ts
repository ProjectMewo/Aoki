import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  track: createStringOption({
    description: 'the Spotify track name to search for',
    description_localizations: {
      "en-US": 'the Spotify track name to search for',
      "vi": 'tên bài hát Spotify mà cậu muốn tìm kiếm'
    },
    required: true,
    autocomplete: async (interaction) => await TrackLicense.prototype.autocomplete(interaction)
  })
};

async function getSpotifyToken(): Promise<string | null> {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
      },
      body: new URLSearchParams({ grant_type: "client_credentials" })
    });
    const data = await response.json();
    return data.access_token || null;
  } catch (err) {
    console.error("Error fetching Spotify token:", err);
    return null;
  }
}

@Declare({
  name: 'track-license',
  description: 'get licensing information for a Spotify track. Not reliable.'
})
@Locales({
  name: [
    ['en-US', 'track-license'],
    ['vi', 'giấy-phép-bài-hát']
  ],
  description: [
    ['en-US', 'get licensing information for a Spotify track. Not reliable.'],
    ['vi', 'lấy thông tin giấy phép cho một bài hát Spotify. Không đảm bảo chính xác.']
  ]
})
@Group('tourney')
@Options(options)
export default class TrackLicense extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getAutocompleteValue();
    if (!focusedValue) return interaction.respond([]);

    try {
      const token = await getSpotifyToken();
      if (!token) return interaction.respond([]);

      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(focusedValue)}&type=track&limit=20`;
      const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.tracks?.items) return interaction.respond([]);

      const choices = data.tracks.items.map((track: any) => ({
        name: `${track.artists[0].name} - ${track.name}`,
        value: track.id,
      }));

      await interaction.respond(choices.slice(0, 20));
    } catch (err) {
      console.error("Error during autocomplete:", err);
      await interaction.respond([]);
    }
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.trackLicense;
    const trackId = ctx.options.track;

    await ctx.deferReply();

    try {
      const token = await getSpotifyToken();
      if (!token) {
        return AokiError.API_ERROR({ sender: ctx.interaction, content: t.apiError });
      }

      const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json());

      if (trackRes.error) {
        return AokiError.API_ERROR({ sender: ctx.interaction, content: t.trackError(trackRes.error.message) });
      }

      if (!trackRes.album?.href) {
        return AokiError.API_ERROR({ sender: ctx.interaction, content: t.apiError });
      }

      const albumRes = await fetch(trackRes.album.href, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json());

      if (albumRes.error) {
        return AokiError.API_ERROR({ sender: ctx.interaction, content: t.albumError(albumRes.error.message) });
      }

      const copyright = albumRes.copyrights?.map((c: any) => c.text).join('\n') || t.unknown;
      const label = albumRes.label || t.unknown;
      let inferredLicense = t.unknown;

      if (/public domain/i.test(copyright)) inferredLicense = t.inferredLicensePublicDomain;
      else if (/creative commons/i.test(copyright)) inferredLicense = t.inferredLicenseCreativeCommons;
      else if (/all rights reserved/i.test(copyright)) inferredLicense = t.inferredLicenseAllRightsReserved;

      const embed = {
        title: trackRes.name,
        url: trackRes.external_urls.spotify,
        fields: [
          { name: t.embed.artistField, value: trackRes.artists.map((a: any) => a.name).join(', ') },
          { name: t.embed.albumField, value: albumRes.name },
          { name: t.embed.labelField, value: label },
          { name: t.embed.copyrightField, value: copyright },
          { name: t.embed.inferredLicenseField, value: `${inferredLicense}\n${t.inferredLicenseNote}` }
        ],
        thumbnail: { url: trackRes.album.images[0]?.url },
        color: 10800862
      };

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in track-license command:", error);
      return AokiError.INTERNAL({ sender: ctx.interaction, content: "An error occurred while processing the request. Please try again later." });
    }
  }
}
