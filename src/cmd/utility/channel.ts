import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class Channel extends Subcommand {
  constructor() {
    super({
      name: 'channel',
      description: 'get information about a channel',
      permissions: [],
      options: [
        {
          type: 'channel',
          name: 'channel',
          description: 'the channel to get information about',
          required: false
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const channel = i.options.getChannel("channel") ?? i.channel;
    
    if (!channel) {
      throw new Error("Channel not found.");
    }
    
    // Ensure channel has a name property
    if (!('name' in channel)) {
      throw new Error("Invalid channel type.");
    }
    
    const ch = channel as { name: string; createdAt: Date | string; position?: number; nsfw?: boolean; slowmode?: number; topic?: string; id: string };
    
    const imgur = "https://i.imgur.com/";
    const channelTypes: { [key: number]: { icon: string; type: string } } = {
      0: { icon: `${imgur}IkQqhRj.png`, type: "Text Channel" },
      2: { icon: `${imgur}VuuMCXq.png`, type: "Voice Channel" },
      4: { icon: `${imgur}Ri5YA3G.png`, type: "Guild Category" },
      5: { icon: `${imgur}4TKO7k6.png`, type: "News Channel" },
      10: { icon: `${imgur}Dfu73ox.png`, type: "Threads Channel" },
      11: { icon: `${imgur}Dfu73ox.png`, type: "Threads Channel" },
      12: { icon: `${imgur}Dfu73ox.png`, type: "Threads Channel" },
      13: { icon: `${imgur}F92hbg9.png`, type: "Stage Channel" },
      14: { icon: `${imgur}Dfu73ox.png`, type: "Guild Directory" },
      15: { icon: `${imgur}q13YoYu.png`, type: "Guild Forum" }
    };
    
    // channel.type might be unknown, cast to number if safe
    const key = (channel as any).type as number;
    const { icon, type } = channelTypes[key] || { icon: "", type: "Unknown" };
    
    const createdAt = new Date((ch.createdAt as string) || Date.now());
    const time = i.client.utils.time.formatDistance(createdAt, new Date());
    
    const authorFieldName = `${ch.name}${ch.name.endsWith("s") ? "'" : "'s"} Information`;
    const field = i.client.utils.string.keyValueField({
      "Position": ch.position || "Unknown",
      "Type": type,
      "Created": time,
      "NSFW?": ch.nsfw ? "Yes" : "No",
      "Slowmode": ch.slowmode || "None",
      "ID": ch.id,
      "Topic": ch.topic
    }, 30);
    
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setAuthor({ name: authorFieldName })
      .setThumbnail(icon)
      .addFields([{ name: "\u2000", value: field }])
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();
      
    await i.editReply({ embeds: [embed] });
  }
}