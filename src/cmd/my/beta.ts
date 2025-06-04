import { meta } from "@assets/cmdMeta";
import {
  CommandContext,
  createStringOption,
  Declare,
  Embed,
  SubCommand,
  Options,
  Locales,
  Button,
  ActionRow
} from "seyfert";
import { ButtonStyle } from "seyfert/lib/types";

const options = {
  reason: createStringOption({
    description: 'reason for requesting beta access',
    description_localizations: meta.my.beta.reason,
    required: true
  })
};

@Declare({
  name: 'beta',
  description: 'ask my sensei to be whitelisted for beta programs',
  defaultMemberPermissions: ['ManageGuild']
})
@Locales(meta.my.beta.loc)
@Options(options)
export default class Beta extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.beta;
    const reason = ctx.options.reason;

    await ctx.deferReply();

    // Legal notice
    const legalNotice = t.legalNotice;

    // Create a confirmation button
    const confirmButton = new Button()
      .setCustomId('confirm-legal')
      .setLabel(t.confirmAcknowledgement)
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRow<Button>().addComponents(confirmButton);

    // Send legal notice with confirmation button
    const message = await ctx.editOrReply({
      content: legalNotice,
      components: [actionRow]
    }, true);

    // Wait for the user's confirmation
    const confirmation = message.createComponentCollector({
      filter: interaction => interaction.customId === 'confirm-legal' && interaction.user.id === ctx.interaction.user.id,
      timeout: 120000 // 2 minutes
    });

    confirmation.run("confirm-legal", async (interaction) => {
      // Construct embed
      const embed = new Embed()
        .setColor(10800862)
        .setTitle(`Beta Access Request`)
        .setThumbnail("https://i.imgur.com/1xMJ0Ew.png")
        .setFooter({ text: "Deal with this, I'm outta here", iconUrl: ctx.author.avatarURL() })
        .setDescription(`*Sent by **${ctx.author.username}***\n\n**Reason:** ${reason}`)
        .setTimestamp();

      // Try to send to log channel if configured
      const sendToLogs = async (embed: Embed) => {
        try {
          const logChannelId = process.env.LOG_CHANNEL;
          if (!logChannelId) return;

          const channel = await ctx.client.channels.fetch(logChannelId);
          if (channel) {
            await ctx.client.messages.write(channel.id, { embeds: [embed] });
          }
        } catch (error) {
          console.error("Failed to send to logs:", error);
        }
      };

      // Send response
      await interaction.editOrReply({ content: t.thankYouRequest, components: [] });
      await sendToLogs(embed);
    });
  }
}