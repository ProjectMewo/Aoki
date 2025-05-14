import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createChannelOption, 
  Declare, 
  Embed, 
  SubCommand, 
  Options, 
  LocalesT
} from "seyfert";

const options = {
  channel: createChannelOption({
    description: 'the channel to get information about',
    description_localizations: {
      "en-US": 'the channel to get information about',
      "vi": 'kênh mà cậu muốn lấy thông tin'
    },
    required: false
  })
};

@Declare({
  name: 'channel',
  description: 'get information about a channel'
})
@LocalesT('utility.channel.name', 'utility.channel.description')
@Options(options)
export default class Channel extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.channel;
    const { channel } = ctx.options;
    const targetChannel = channel ?? ctx.client.channels.fetch(ctx.channelId);

    if (!targetChannel) {
      throw AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.notFound
      });
    }

    if (!('name' in targetChannel)) {
      throw AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.notFound
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
      0: { icon: `${imgur}IkQqhRj.png`, type: t.types.text },
      2: { icon: `${imgur}VuuMCXq.png`, type: t.types.voice },
      4: { icon: `${imgur}Ri5YA3G.png`, type: t.types.category },
      5: { icon: `${imgur}4TKO7k6.png`, type: t.types.news },
      10: { icon: `${imgur}Dfu73ox.png`, type: t.types.threads },
      11: { icon: `${imgur}Dfu73ox.png`, type: t.types.threads },
      12: { icon: `${imgur}Dfu73ox.png`, type: t.types.threads },
      13: { icon: `${imgur}F92hbg9.png`, type: t.types.stage },
      14: { icon: `${imgur}Dfu73ox.png`, type: t.types.dir },
      15: { icon: `${imgur}q13YoYu.png`, type: t.types.forum }
    };

    const key = (targetChannel as any).type as number;
    const { icon, type } = channelTypes[key] || { icon: "", type: "Unknown" };

    const createdAt = new Date((ch.createdAt as string) || Date.now());
    const time = ctx.client.utils.time.formatDistance(createdAt, new Date());

    const authorFieldName = t.infoField(ch.name);
    const field = ctx.client.utils.string.keyValueField({
      [t.info.position]: ch.position || "Unknown",
      [t.info.type]: type,
      [t.info.created]: time,
      [t.info.nsfw]: ch.nsfw ? t.info.yes : t.info.no,
      [t.info.slowmode]: ch.slowmode || t.info.no,
      [t.info.id]: ch.id,
      [t.info.topic]: ch.topic
    }, 30);

    const embed = new Embed()
      .setColor(10800862)
      .setAuthor({ name: authorFieldName })
      .setThumbnail(icon)
      .addFields([{ name: "\u2000", value: field }])
      .setFooter({
        text: t.requestedBy(ctx.author.username),
        iconUrl: ctx.author.avatarURL()
      })
      .setTimestamp();

    await ctx.editOrReply({ embeds: [embed] });
  }
}