import { Subcommand } from "@struct/handlers/Subcommand";
import AokiError from "@struct/handlers/AokiError";
import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

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

export default class TrackLicense extends Subcommand {
  constructor() {
    super({
      name: 'track-license',
      description: 'get licensing information for a Spotify track. Not reliable, use along with /osu verify-artist.',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'track',
          description: 'the Spotify track name to search for',
          isAutocomplete: true,
          required: true,
        },
      ],
    });
  }

  async autocomplete(i: AutocompleteInteraction): Promise<void> {
    const focused = i.options.getFocused();
    if (!focused) return await i.respond([]);

    try {
      const token = await getSpotifyToken();
      if (!token) return await i.respond([]);

      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(focused)}&type=track&limit=20`;
      const response = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.tracks?.items) return await i.respond([]);

      const choices = data.tracks.items.map((track: any) => ({
        name: `${track.artists[0].name} - ${track.name}`,
        value: track.id,
      }));

      await i.respond(choices.slice(0, 20));
    } catch (err) {
      console.error("Error during autocomplete:", err);
      await i.respond([]);
    }
  }

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    try {
      const trackId = i.options.getString("track")!;
      const token = await getSpotifyToken();
      if (!token) {
        return AokiError.API_ERROR({ sender: i, content: "Failed to fetch Spotify token." });
      }

      const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json());

      if (trackRes.error) {
        return AokiError.API_ERROR({ sender: i, content: `Error fetching track: ${trackRes.error.message || 'Unknown error'}` });
      }

      if (!trackRes.album?.href) {
        return AokiError.API_ERROR({ sender: i, content: "Track information is incomplete or malformed." });
      }

      const albumRes = await fetch(trackRes.album.href, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json());

      if (albumRes.error) {
        return AokiError.API_ERROR({ sender: i, content: `Error fetching album: ${albumRes.error.message || 'Unknown error'}` });
      }

      const copyright = albumRes.copyrights?.map((c: any) => c.text).join('\n') || "Unknown";
      const label = albumRes.label || "Unknown";
      let inferredLicense = "Unknown";

      if (/public domain/i.test(copyright)) inferredLicense = "No rights reserved (Public Domain)";
      else if (/creative commons/i.test(copyright)) inferredLicense = "Creative Commons (CC)";
      else if (/all rights reserved/i.test(copyright)) inferredLicense = "All rights reserved";

      const embed = new EmbedBuilder()
        .setTitle(trackRes.name)
        .setURL(trackRes.external_urls.spotify)
        .addFields(
          { name: "Artist", value: trackRes.artists.map((a: any) => a.name).join(', ') },
          { name: "Album", value: albumRes.name },
          { name: "Label", value: label },
          { name: "Copyright", value: copyright },
          { name: "Inferred License", value: `${inferredLicense}\n*Note: License inference may not be accurate.*` }
        )
        .setThumbnail(trackRes.album.images[0]?.url)
        .setColor(10800862);

      await i.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in track-license command:", error);
      return AokiError.INTERNAL({ sender: i, content: "An error occurred while processing the request. Please try again later." });
    }
  }
}
