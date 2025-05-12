import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  Options,
  SubCommand
} from "seyfert";

const options = {
  name: createStringOption({
    description: "the name of the artist to verify",
    required: true,
    autocomplete: async (interaction) => await VerifyArtist.prototype.autocomplete(interaction)
  })
};

@Declare({
  name: "verify-artist",
  description: "check this artist's policies before using their songs"
})
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
    const name = ctx.options.name;
    const artist = VerifyArtist.artists.find(
      (a) =>
        a.name.toLowerCase() === name.toLowerCase() ||
        a.aliases.some((alias) => alias.toLowerCase() === name.toLowerCase())
    );

    if (!artist) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `I couldn't find any artist with the name **${name}**. Please check the spelling and try again. If the artist exists and you know their permission status, tell my sensei. They'll be happy to add it!\n\nOtherwise, if you don't, your best bet is to contact the artist directly and ask for permission.`
      });
    }

    let status = "";
    if (artist.status === 1) {
      status = artist.adofai_artist_disclaimers.length === 0
        ? ":green_square: Allowed"
        : ":yellow_square: Mostly Allowed";
    } else if (artist.status === 2) {
      status = ":red_square: Mostly Declined";
    } else {
      status = ":question: Undetermined";
    }

    const disclaimerCount = artist.adofai_artist_disclaimers.length;
    const disclaimerInitialText = `- *This artist has **${disclaimerCount}** disclaimer(s).*\n- *If the disclaimer field only contains song names, it means you cannot specifically use that song in your maps.*\n`;
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
      : "No disclaimer. You can use this artist's songs freely.";

    const evidenceArray = artist.evidenceArray || [];
    const evidenceText = evidenceArray.map((e, index) => `**\`${index + 1}.\`** [Click here.](${e})\n`).join("");
    const evidenceEmbed = evidenceArray.length > 0 ? evidenceText : "No evidence found.";

    const link1 = artist.link_1 ? `${artist.link_1}` : "";
    const link2 = artist.link_2 ? `\n${artist.link_2}` : "";
    const linksEmbed = link1 || link2 ? `${link1}${link2}` : "No links found.";

    const dataSource = artist.link_1.includes("https://osu.ppy.sh") ? "osu!" : "ADOFAI";

    const embed = new Embed()
      .setColor(10800862)
      .setTitle(`${artist.name}'s Policies`)
      .addFields(
        { name: "Links", value: linksEmbed, inline: false },
        { name: "Status", value: status, inline: true },
        { name: "Days since request", value: `${artist.daysSinceRequest}`, inline: true },
        { name: "Disclaimer", value: disclaimer, inline: false },
        { name: "Evidence", value: evidenceEmbed, inline: false }
      )
      .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Copyright.svg/480px-Copyright.svg.png")
      .setURL(artist.link_1)
      .setFooter({ text: `This data is from ${dataSource}`, iconUrl: ctx.author.avatarURL()! })
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