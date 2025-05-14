import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
// Load artists data once and cache it for future use
// TODO: rework the data of this file 
const artists = await (async () => {
  try {
    const response = await fetch("https://akira.s-ul.eu/tbxW3Gh7");
    return await response.json();
  } catch (error) {
    console.error("Failed to load artists data:", error);
    return [];
  }
})() as Artist[];

// Typings for artists
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
  link_1: string; // Link 1 is always present, link 2 is not
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

export default class VerifyArtist extends Subcommand {
  constructor() {
    super({
      name: 'verify-artist',
      description: 'check this artist\'s policies before using their songs',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'name',
          description: 'The name of the artist to verify',
          required: true
        }
      ]
    });
  }
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const name = i.options.getString('name', true);
    const artist = artists.find((a: any) => 
      a.name.toLowerCase() === name.toLowerCase() ||
      a.aliases.some((alias: string) => alias.toLowerCase() === name.toLowerCase())
    ) as Artist;

    if (!artist) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: `I couldn't find any artist with the name **${name}**. Please check the spelling and try again. If the artist exists and you know their permission status, tell my sensei. They'll be happy to add it!\n\nOtherwise, if you don't, your best bet is to contact the artist directly and ask for permission.`,
      });
    }

    // Convert the status of the artist
    // Since key 1 can be 2 statuses at once (blame ADOFAI),
    // we need to do if/else
    let status = '';
    if (artist.status === 1) {
      // If the field adofai_artist_disclaimers is empty, it's good
      // Otherwise, there is a disclaimer they need to take into account
      if (artist.adofai_artist_disclaimers.length === 0) {
        status = ':green_square: Allowed';
      } else {
        status = ':yellow_square: Mostly Allowed';
      };
    } else if (artist.status === 2) {
      status = ':red_square: Mostly Declined';
    } else status = ':question: Undetermined'
    // Construct disclaimer text
    // If the artist has no disclaimers, we don't need to show this field
    const disclaimerCount = artist.adofai_artist_disclaimers.length;
    const disclaimerInitialText = `- *This artist has **${disclaimerCount}** disclaimer(s).*\n- *If the disclaimer field only contains song names, it means you cannot specifically use that song in your maps.*\n`;
    const disclaimerText = artist.adofai_artist_disclaimers.flatMap((d, disclaimerIndex) => {
      // Check if the disclaimer text contains multiple lines
      if (d.text.includes('\r\n')) {
        // Split the text by line breaks and map each line
        return d.text.split(/\r\n/).map((line, lineIndex) => {
          // Remove leading hyphens and trim whitespace
          const cleanedLine = line.trim().replace(/^-\s*/, '');
          return `**\`${disclaimerIndex + 1}.${lineIndex + 1}.\`** ${cleanedLine}\n`;
        });
      } else {
        // Handle single-line disclaimer as before
        return [`**\`${disclaimerIndex + 1}\`**. ${d.text}\n`];
      }
    }).join('');
    const disclaimer = artist.adofai_artist_disclaimers.length > 0 ? disclaimerInitialText + disclaimerText : "No disclaimer. You can use this artist's songs freely.";
    // Construct evidence text
    const evidenceArray = artist.evidenceArray || [];
    const evidenceText = evidenceArray.map((e, index) => `**\`${index + 1}.\`** [Click here.](${e})\n`).join('');
    const evidenceEmbed = evidenceArray.length > 0 ? `${evidenceText}` : 'No evidence found.';
    // Construct links
    // Format links with proper labels
    const link1 = artist.link_1 ? `${artist.link_1}` : '';
    const link2 = artist.link_2 ? `\n${artist.link_2}` : '';
    const linksEmbed = link1 || link2 ? `${link1}${link2}` : 'No links found.';
    // Check if this entry was from osu! or ADOFAI 
    // !NOT RELIABLE FOR ALL ENTRIES!
    // This is just a guess based on the link_1 field
    const dataSource = artist.link_1.includes("https://osu.ppy.sh") ? "osu!" : "ADOFAI";

    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setTitle(`${artist.name}'s Policies`)
      .addFields(
        { name: 'Links', value: linksEmbed, inline: false },
        { name: 'Status', value: status, inline: true },
        { name: 'Days since request', value: `${artist.daysSinceRequest}`, inline: true },
        { name: 'Disclaimer', value: disclaimer, inline: false },
        { name: 'Evidence', value: evidenceEmbed, inline: false },
      )
      .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Copyright.svg/480px-Copyright.svg.png") // The copyright symbol
      .setURL(artist.link_1)
      .setFooter({ text: `This data is from ${dataSource}`, iconURL: i.user.avatarURL()! })
      .setTimestamp();

    await i.reply({ embeds: [embed] });
  }
}