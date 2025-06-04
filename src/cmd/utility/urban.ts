import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  TextGuildChannel,
  Locales
} from "seyfert";

const options = {
  query: createStringOption({
    description: "the term to search for",
    required: true,
    description_localizations: meta.utility.urban.query
  })
};

@Declare({
  name: "urban",
  description: "search for a definition on Urban Dictionary"
})
@Locales(meta.utility.urban.loc)
@Options(options)
export default class Urban extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).utility.urban;
    const { query } = ctx.options;

    await ctx.deferReply();

    try {
      if (
        await ctx.client.utils.profane.isProfane(query) &&
        !(ctx.interaction.channel as TextGuildChannel).nsfw
      ) {
        throw AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: t.profaneQuery
        });
      }

      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.3"
      };

      const res = await fetch(
        `https://api.urbandictionary.com/v0/define?term=${query}`,
        { headers }
      ).then((res) => res.json());

      if (!res?.list?.length) {
        throw AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: t.noDefinition
        });
      }

      const definition = res.list[0];
      const nsfw = (ctx.interaction.channel as TextGuildChannel).nsfw;

      const truncateText = async (text: string, maxLength: number): Promise<string> => {
        const cleanedText = nsfw
          ? text
          : await ctx.client.utils.profane.cleanProfane(text);
        return ctx.client.utils.string.textTruncate(cleanedText, maxLength);
      };

      const definitionText = await truncateText(definition.definition, 1000);
      const exampleText = await truncateText(definition.example || "N/A", 1000);
      const authorText = await truncateText(definition.author || "N/A", 250);

      const embed = new Embed()
        .setColor(10800862)
        .setTitle(`Definition of ${definition.word}`)
        .setURL(definition.urbanURL)
        .addFields([
          { name: "...is", value: `\`\`\`fix\n${definitionText}\n\`\`\`` },
          { name: "Examples", value: `\`\`\`fix\n${exampleText}\n\`\`\`` },
          { name: "Submitted by", value: `\`\`\`fix\n${authorText}\n\`\`\`` },
          {
            name: "Profane Word?",
            value:
              "Yell at my sensei through `/my fault`, the patch should be added in a few working days."
          }
        ])
        .setFooter({
          text: t.requestedBy(ctx.author.username),
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({ embeds: [embed] });
    } catch (error) {
      if (!(error instanceof AokiError)) {
        AokiError.USER_INPUT({
          sender: ctx.interaction,
          content: t.fetchError
        });
      }
    }
  }
}