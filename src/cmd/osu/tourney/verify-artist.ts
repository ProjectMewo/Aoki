import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  name: createStringOption({
    description: "the name of the artist to verify",
    description_localizations: {
      "en-US": "the name of the artist to verify",
      "vi": "tên của nghệ sĩ cậu muốn kiểm tra"
    },
    required: true,
    autocomplete: async (interaction) => await VerifyArtist.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: "verify-artist",
  description: "check this artist's policies before using their songs"
})
@Locales({
  name: [
    ['en-US', 'verify-artist'],
    ['vi', 'kiểm-tra-nghệ-sĩ']
  ],
  description: [
    ['en-US', "check this artist's policies before using their songs"],
    ['vi', "kiểm tra chính sách của nghệ sĩ này trước khi sử dụng bài hát của họ"]
  ]
})
@Group('tourney')
@Options(options)
export default class VerifyArtist extends SubCommand {
  private static artists: Artist[] = [];

  static async loadArtists(): Promise<void> {
    try {
      const response = await fetch("https://akira.s-ul.eu/tbxW3Gh7");
      VerifyArtist.artists = await response.json();
    } catch (error) {
      console.error("Failed to load artists data:", error);
      VerifyArtist.artists = [];
    }
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getAutocompleteValue();

    if (!focusedValue) return interaction.respond([]);

    const results = VerifyArtist.artists
      .filter((artist) =>
        artist.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
        artist.aliases.some((alias) => alias.toLowerCase().includes(focusedValue.toLowerCase()))
      )
      .slice(0, 25)
      .map((artist) => ({
        name: artist.name,
        value: artist.name
      }));

    await interaction.respond(results);
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.verifyArtist;
    const name = ctx.options.name;
    const artist = VerifyArtist.artists.find(
      (a) =>
        a.name.toLowerCase() === name.toLowerCase() ||
        a.aliases.some((alias) => alias.toLowerCase() === name.toLowerCase())
    );

    if (!artist) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.notFound(name)
      });
    }

    let status = "";
    if (artist.status === 1) {
      status = artist.adofai_artist_disclaimers.length === 0
        ? t.status.allowed
        : t.status.mostlyAllowed;
    } else if (artist.status === 2) {
      status = t.status.mostlyDeclined;
    } else {
      status = t.status.undetermined;
    }

    const disclaimerCount = artist.adofai_artist_disclaimers.length;
    const disclaimerInitialText = t.disclaimer.initialText(disclaimerCount);
    const disclaimerText = artist.adofai_artist_disclaimers.flatMap((d, disclaimerIndex) => {
      if (d.text.includes("\r\n")) {
        return d.text.split(/\r\n/).map((line, lineIndex) => {
          const cleanedLine = line.trim().replace(/^-\s*/, "");
          return `**\`${disclaimerIndex + 1}.${lineIndex + 1}.\`** ${cleanedLine}\n`;
        });
      } else {
        return [`**\`${disclaimerIndex + 1}\`**. ${d.text}\n`];
      }
    }).join("");
    const disclaimer = disclaimerCount > 0
      ? disclaimerInitialText + disclaimerText
      : t.disclaimer.noDisclaimer;

    const evidenceArray = artist.evidenceArray || [];
    const evidenceText = evidenceArray.map((e, index) => t.evidence.evidenceText(index, e)).join("");
    const evidenceEmbed = evidenceArray.length > 0 ? evidenceText : t.evidence.noEvidence;

    const link1 = artist.link_1 ? `${artist.link_1}` : "";
    const link2 = artist.link_2 ? `\n${artist.link_2}` : "";
    const linksEmbed = link1 || link2 ? `${link1}${link2}` : "No links found.";

    const dataSource = artist.link_1.includes("https://osu.ppy.sh") ? "osu!" : "ADOFAI";

    const embed = new Embed()
      .setColor(10800862)
      .setTitle(t.embed.title(artist.name))
      .addFields(
        { name: t.embed.fields.links, value: linksEmbed, inline: false },
        { name: t.embed.fields.status, value: status, inline: true },
        { name: t.embed.fields.daysSinceRequest, value: `${artist.daysSinceRequest}`, inline: true },
        { name: t.embed.fields.disclaimer, value: disclaimer, inline: false },
        { name: t.embed.fields.evidence, value: evidenceEmbed, inline: false }
      )
      .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Copyright.svg/480px-Copyright.svg.png")
      .setURL(artist.link_1)
      .setFooter({ text: t.embed.footer(dataSource), iconUrl: ctx.author.avatarURL()! })
      .setTimestamp();

    await ctx.editOrReply({ embeds: [embed] });
  }
}

interface ArtistDisclaimer {
  id: number;
  adofai_artist_id: number;
  text: string;
  lang: string;
  created_at: string;
  updated_at: string;
}

interface Artist {
  id: number;
  name: string;
  aliases: string[];
  evidence_url: string;
  link_1: string;
  link_2?: string;
  status: number;
  status_new: number;
  created_at: string;
  updated_at: string;
  app: string;
  daysSinceRequest: number;
  evidenceArray: string[];
  adofai_artist_disclaimers: ArtistDisclaimer[];
}

// Load artists data on startup
VerifyArtist.loadArtists();