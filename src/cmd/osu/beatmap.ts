import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  MessageFlags, 
  StringSelectMenuBuilder, 
  StringSelectMenuInteraction, 
  TextChannel 
} from "discord.js";
import { Beatmapset } from "../../types/beatmapset";
import AokiError from "@struct/handlers/AokiError";

export default class Beatmap extends Subcommand {
  private baseUrl: string;
  // @ts-ignore
  private api_v1: string;
  private api_v2: string;
  private api_oa: string;
  private osuV2Token: { access_token: string, expires_at: number } | null;
  private dev: boolean;
  
  constructor() {
    super({
      name: 'beatmap',
      description: 'search for beatmaps by query',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'query',
          description: 'search query for the beatmap',
          required: true
        },
        {
          type: 'string',
          name: 'mode',
          description: 'filter by game mode',
          required: false,
          choices: [
            { name: 'osu!standard', value: '0' },
            { name: 'osu!taiko', value: '1' },
            { name: 'osu!catch', value: '2' },
            { name: 'osu!mania', value: '3' }
          ]
        },
        {
          type: 'string',
          name: 'status',
          description: 'filter by ranked status',
          required: false,
          choices: [
            { name: 'Ranked', value: 'ranked' },
            { name: 'Qualified', value: 'qualified' },
            { name: 'Loved', value: 'loved' },
            { name: 'Pending', value: 'pending' },
            { name: 'Graveyard', value: 'graveyard' },
            { name: 'Any', value: 'any' }
          ]
        },
        {
          type: 'string',
          name: 'sort',
          description: 'sort the results',
          required: false,
          choices: [
            { name: 'Relevance', value: 'relevance' },
            { name: 'Date (newest)', value: 'plays' },
            { name: 'Difficulty', value: 'difficulty' }
          ]
        },
        {
          type: 'string',
          name: 'genre',
          description: 'filter by music genre',
          required: false,
          choices: [
            { name: 'Any', value: 'any' },
            { name: 'Unspecified', value: 'unspecified' },
            { name: 'Video Game', value: 'video-game' },
            { name: 'Anime', value: 'anime' },
            { name: 'Rock', value: 'rock' },
            { name: 'Pop', value: 'pop' },
            { name: 'Other', value: 'other' },
            { name: 'Novelty', value: 'novelty' },
            { name: 'Hip Hop', value: 'hip-hop' },
            { name: 'Electronic', value: 'electronic' },
            { name: 'Metal', value: 'metal' },
            { name: 'Classical', value: 'classical' },
            { name: 'Folk', value: 'folk' },
            { name: 'Jazz', value: 'jazz' }
          ]
        },
        {
          type: 'string',
          name: 'language',
          description: 'filter by language',
          required: false,
          choices: [
            { name: 'Any', value: 'any' },
            { name: 'Other', value: 'other' },
            { name: 'English', value: 'english' },
            { name: 'Japanese', value: 'japanese' },
            { name: 'Chinese', value: 'chinese' },
            { name: 'Instrumental', value: 'instrumental' },
            { name: 'Korean', value: 'korean' },
            { name: 'French', value: 'french' },
            { name: 'German', value: 'german' },
            { name: 'Swedish', value: 'swedish' },
            { name: 'Spanish', value: 'spanish' },
            { name: 'Italian', value: 'italian' }
          ]
        },
        {
          type: 'boolean',
          name: 'storyboard',
          description: 'filter maps with storyboards',
          required: false
        }
      ]
    });
    
    this.baseUrl = "https://osu.ppy.sh";
    this.api_v1 = `${this.baseUrl}/api`;
    this.api_v2 = `${this.baseUrl}/api/v2`;
    this.api_oa = `${this.baseUrl}/oauth/token`;
    this.osuV2Token = null;
    this.dev = false;
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const query = i.options.getString("query") || "";
    const mode = i.options.getString("mode") || "0";
    const status = i.options.getString("status") || "any";
    const sort = i.options.getString("sort") || "relevance";
    const genre = i.options.getString("genre") || "any";
    const language = i.options.getString("language") || "any";
    const storyboard = i.options.getBoolean("storyboard") ? '1' : '0';

    // Shorthand
    const string = i.client.utils.string;

    try {
      const searchParams = {
        query: query,
        m: Number(mode),
        status: status,
        genre: genre,
        language: language,
        sort: sort,
        storyboard: storyboard
      };

      const beatmapsets = await this.searchBeatmap({
        type: "beatmaps",
        ...searchParams
      }) as Array<Beatmapset>;

      if (beatmapsets.length === 0) {
        return AokiError.NOT_FOUND({
          sender: i,
          content: "No beatmaps found matching your criteria."
        });
      }
      
      // NSFW filtering
      const beatmapsFiltered = beatmapsets.filter((beatmap: Beatmapset) => {
        if ((i.channel as TextChannel).nsfw) return true;
        else return !beatmap.nsfw;
      });
      
      // Take only 25 first results
      const beatmaps = beatmapsFiltered.slice(0, 25);
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('beatmap_select')
        .setPlaceholder(`Listing ${beatmaps.length} top result${beatmaps.length == 1 ? "" : "s"}. Select to view.`)
        .addOptions(beatmaps.map((beatmap: Beatmapset, index: number) => ({
          label: `${beatmap.artist} - ${beatmap.title}`,
          description: `Mapper: ${beatmap.creator} | Status: ${string.toProperCase(beatmap.status)}`,
          value: index.toString()
        })));

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const message = await i.editReply({ components: [row] });
      
      // Filter for the select menu interaction
      const filter = (interaction: any): interaction is StringSelectMenuInteraction => {
        return interaction.isStringSelectMenu && interaction.isStringSelectMenu() && interaction.customId === 'beatmap_select' && interaction.user.id === i.user.id;
      };
      
      const collector = message.createMessageComponentCollector({ filter, time: 90000 }); // 2 minutes

      collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
        const selectedIndex = parseInt(interaction.values[0]);
        const selectedBeatmap = beatmaps[selectedIndex];

        const detailedEmbed = new EmbedBuilder()
          .setColor(10800862)
          .setAuthor({
            name: `Mapped by ${selectedBeatmap.creator}`,
            iconURL: `https://a.ppy.sh/${selectedBeatmap.user_id}`
          })
          .setDescription(`:notes: [Song preview](https://b.ppy.sh/preview/${selectedBeatmap.id}.mp3) | :frame_photo: [Cover/Background](https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/raw.jpg)`)
          .setTitle(`${string.escapeMarkdown(selectedBeatmap.artist)} - ${string.escapeMarkdown(selectedBeatmap.title)}`)
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}`)
          .setImage(`https://assets.ppy.sh/beatmaps/${selectedBeatmap.id}/covers/cover.jpg`)
          .addFields(
            { name: "Raw Title", value: `${string.escapeMarkdown(selectedBeatmap.artist_unicode)} - ${string.escapeMarkdown(selectedBeatmap.title_unicode)}`, inline: false },
            { name: "Source", value: selectedBeatmap.source || "None", inline: false },
            { name: "BPM", value: selectedBeatmap.bpm.toString(), inline: true },
            { name: "Favorites", value: selectedBeatmap.favourite_count.toString(), inline: true },
            { name: "Spotlight Status", value: string.toProperCase(selectedBeatmap.spotlight.toString()), inline: true },
            { name: "Set ID", value: selectedBeatmap.id.toString(), inline: true },
            { name: "Is NSFW?", value: string.toProperCase(selectedBeatmap.nsfw.toString()), inline: true },
            { name: "Last updated", value: i.client.utils.time.formatDistance(new Date(selectedBeatmap.last_updated), new Date()), inline: true },
            { name: "Status", value: `${string.toProperCase(selectedBeatmap.status)}${selectedBeatmap.ranked_date ? ` on ${i.client.utils.time.formatDate(new Date(selectedBeatmap.ranked_date), "ddMMMMyyyy")}` : ""}`, inline: false },
          )
          .setFooter({ text: `This set has ${selectedBeatmap.beatmaps.length} ${selectedBeatmap.status} beatmaps` })
          .setTimestamp();

        const downloadButton = new ButtonBuilder()
          .setLabel('osu!web download')
          .setURL(`https://osu.ppy.sh/beatmapsets/${selectedBeatmap.id}/download`)
          .setStyle(ButtonStyle.Link);

        const directButton = new ButtonBuilder()
          .setLabel('osu!direct download')
          .setURL(`https://aoki.hackers.moe/osudirect?id=${selectedBeatmap.beatmaps[0].id}`)
          .setStyle(ButtonStyle.Link);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(downloadButton, directButton);

        await interaction.reply({ embeds: [detailedEmbed], components: [buttonRow], flags: MessageFlags.Ephemeral });
      });
      
    } catch (error) {
      console.error('Error searching for beatmaps:', error);
      return AokiError.API_ERROR({
        sender: i,
        content: 'An error occurred while searching for beatmaps. Please try again later.'
      });
    }
  }
  
  // API helper methods
  async getOsuV2Token() {
    // Avoid spamming the osu api
    // If the token is still valid, return it
    if (this.osuV2Token && this.osuV2Token.expires_at > Date.now()) {
      return this.osuV2Token.access_token;
    }
    
    // Otherwise ask for it using our credentials
    const params = new URLSearchParams({
      client_id: this.dev ? process.env.OSU_DEV_ID! : process.env.OSU_ID!,
      client_secret: this.dev ? process.env.OSU_DEV_SECRET! : process.env.OSU_SECRET!,
      grant_type: 'client_credentials',
      scope: 'public'
    });
    
    const res = await fetch(this.api_oa, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const data = await res.json();
    
    // Then save it for later fetches until the end of the cycle
    this.osuV2Token = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000
    };
    
    return data.access_token;
  }

  async searchBeatmap(params: any) {
    const token = await this.getOsuV2Token();
    
    // Build URL with query parameters
    const query = Object.entries(params)
      .filter(([key, value]) => key !== 'type' && value !== 'any')
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join('&');
    
    const url = `${this.api_v2}/beatmapsets/search?${query}`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await res.json();
    return data.beatmapsets;
  }
}