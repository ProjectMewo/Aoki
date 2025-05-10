import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createChannelOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  channel: createChannelOption({
    description: 'the channel to get information about',
    required: false
  })
};

@Declare({
  name: 'channel',
  description: 'get information about a channel'
})
@Options(options)
export default class Channel extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { channel } = ctx.options;
    const targetChannel = channel ?? ctx.channel;

    if (!targetChannel) {
      throw AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Channel not found."
      });
    }

    if (!('name' in targetChannel)) {
      throw AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Invalid channel type."
      });
    }

    const ch = targetChannel as { 
      name: string; 
      createdAt: Date | string; 
      position?: number; 
      nsfw?: boolean; 
      slowmode?: number; 
      topic?: string; 
      id: string 
    };

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

    const key = (targetChannel as any).type as number;
    const { icon, type } = channelTypes[key] || { icon: "", type: "Unknown" };

    const createdAt = new Date((ch.createdAt as string) || Date.now());
    const time = ctx.client.utils.time.formatDistance(createdAt, new Date());

    const authorFieldName = `${ch.name}${ch.name.endsWith("s") ? "'" : "'s"} Information`;
    const field = ctx.client.utils.string.keyValueField({
      "Position": ch.position || "Unknown",
      "Type": type,
      "Created": time,
      "NSFW?": ch.nsfw ? "Yes" : "No",
      "Slowmode": ch.slowmode || "None",
      "ID": ch.id,
      "Topic": ch.topic
    }, 30);

    const embed = new Embed()
      .setColor(10800862)
      .setAuthor({ name: authorFieldName })
      .setThumbnail(icon)
      .addFields([{ name: "\u2000", value: field }])
      .setFooter({
        text: `Requested by ${ctx.author.username}`,
        iconUrl: ctx.author.avatarURL()
      })
      .setTimestamp();

    await ctx.editOrReply({ embeds: [embed] });
  }
}