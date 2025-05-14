import AokiError from "@struct/AokiError";
import {
  ActionRow,
  Button,
  CommandContext,
  Declare,
  SubCommand,
  Modal,
  TextInput,
  WebhookMessage,
  RoleSelectMenu,
  ChannelSelectMenu,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  ModalSubmitInteraction,
  Guild,
  TextGuildChannel,
  SelectMenuInteraction,
  LocalesT
} from "seyfert";
import { 
  ButtonStyle, 
  MessageFlags, 
  PermissionFlagsBits, 
  TextInputStyle 
} from "seyfert/lib/types";

@Declare({
  name: "customize",
  description: "customize the verification message",
})
@LocalesT('verify.customize.name', 'verify.customize.description')
export default class Customize extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).verify.customize;
    await ctx.deferReply(true);

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const me = await guild.members.fetch(ctx.client.botId);
    const settings = guild.settings.verification;

    if (!settings?.status) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.errors.verificationDisabled
      });
    }

    const customization = {
      title: settings.title || t.embed.defaultTitle,
      thumbnail: settings.thumbnail || guild.iconURL() || "",
      description:
        settings.description ||
        t.embed.defaultDescription,
      roleId: settings.roleId || "",
      channelId: settings.channelId || "",
      color: ctx.client.utils.string.hexToColorResolvable(settings.color || "#FFFFFF"),
    };

    const updatePreview = async (): Promise<WebhookMessage> => {
      const previewEmbed = this.createPreviewEmbed(customization, t);
      const actionRow = this.createActionRow(t);
      const roleRow = this.createRoleSelectRow(t);
      const channelRow = this.createChannelSelectRow(t);

      const message = await ctx.editOrReply({
        content: t.preview.content,
        embeds: [previewEmbed],
        components: [actionRow, roleRow, channelRow],
        flags: MessageFlags.Ephemeral
      }, true);
      return message;
    };

    const message = await updatePreview();

    const collector = message.createComponentCollector({
      timeout: 300000, // 5 minutes
    });

    collector.run("edit_verification", async (interaction: SelectMenuInteraction) => {
      await this.showEditModal(interaction, customization, updatePreview, t);
    });

    collector.run("save_verification", async () => {
      await this.saveVerification(ctx, customization, guild, t);
      collector.stop();
    });

    collector.run("select_role", async (interaction: RoleSelectMenuInteraction) => {
      const role = (await guild.roles.list()).find(r => r.id === interaction.values[0]);
      if (!role) {
        return interaction.editOrReply({
          content: t.roleSelection.roleNotFound,
          flags: MessageFlags.Ephemeral
        });
      }
      const botHighestRole = await me.roles.highest();
      if (role.position >= botHighestRole.position) {
        return interaction.editOrReply({
          content: t.roleSelection.roleTooHigh,
          flags: MessageFlags.Ephemeral
        });
      }
      customization.roleId = interaction.values[0];
      await interaction.editOrReply({
        content: t.roleSelection.roleUpdated,
        flags: MessageFlags.Ephemeral
      });
      await updatePreview();
    });

    collector.run("select_channel", async (interaction: ChannelSelectMenuInteraction) => {
      const channel = await guild.channels.fetch(interaction.values[0]);
      if (!channel) {
        return interaction.editOrReply({
          content: t.channelSelection.channelNotFound,
          flags: MessageFlags.Ephemeral
        });
      }
      if (!(await me.fetchPermissions()).has([PermissionFlagsBits.SendMessages])) {
        return interaction.editOrReply({
          content: t.channelSelection.botNoSendPermission,
          flags: MessageFlags.Ephemeral
        });
      }
      customization.channelId = interaction.values[0];
      await interaction.editOrReply({
        content: t.channelSelection.channelUpdated,
        flags: MessageFlags.Ephemeral
      });
      await updatePreview();
    });
  }

  createRoleSelectRow(t: any): ActionRow<RoleSelectMenu> {
    return new ActionRow<RoleSelectMenu>().setComponents([
      new RoleSelectMenu()
        .setCustomId("select_role")
        .setPlaceholder(t.roleSelection.placeholder)
    ]);
  }

  createChannelSelectRow(t: any): ActionRow<ChannelSelectMenu> {
    return new ActionRow<ChannelSelectMenu>().setComponents([
      new ChannelSelectMenu()
        .setCustomId("select_channel")
        .setPlaceholder(t.channelSelection.placeholder)
    ]);
  }

  createPreviewEmbed(customization: any, t: any) {
    return {
      title: customization.title,
      thumbnail: { url: customization.thumbnail },
      description: customization.description,
      color: customization.color,
      footer: { text: t.preview.lastUpdated(new Date().toLocaleString()) },
    };
  }

  createActionRow(t: any): ActionRow {
    return new ActionRow().setComponents([
      new Button()
        .setCustomId("edit_verification")
        .setLabel(t.buttons.edit)
        .setStyle(ButtonStyle.Primary),
      new Button()
        .setCustomId("save_verification")
        .setLabel(t.buttons.save)
        .setStyle(ButtonStyle.Success),
    ]);
  }

  async showEditModal(
    ctx: SelectMenuInteraction,
    customization: any,
    updatePreview: () => Promise<WebhookMessage>,
    t: any
  ): Promise<void> {
    const titleInput = new TextInput()
      .setCustomId("title")
      .setLabel(t.editVerification.fields.title)
      .setStyle(TextInputStyle.Short)
      .setValue(customization.title)
      .setRequired(true);

    const descriptionInput = new TextInput()
      .setCustomId("description")
      .setLabel(t.editVerification.fields.description)
      .setStyle(TextInputStyle.Paragraph)
      .setValue(customization.description)
      .setRequired(true);

    const thumbnailInput = new TextInput()
      .setCustomId("thumbnail")
      .setLabel(t.editVerification.fields.thumbnail)
      .setStyle(TextInputStyle.Short)
      .setValue(customization.thumbnail)
      .setRequired(false);

    const colorInput = new TextInput()
      .setCustomId("color")
      .setLabel(t.editVerification.fields.color)
      .setStyle(TextInputStyle.Short)
      .setValue(customization.color)
      .setRequired(false);

    const modal = new Modal()
      .setCustomId("edit_verification_modal")
      .setTitle(t.editVerification.title)
      .setComponents([
        new ActionRow<TextInput>().setComponents([titleInput]),
        new ActionRow<TextInput>().setComponents([descriptionInput]),
        new ActionRow<TextInput>().setComponents([thumbnailInput]),
        new ActionRow<TextInput>().setComponents([colorInput]),
      ]);

    modal.run(async (modalSubmission: ModalSubmitInteraction) => {
      customization.title = modalSubmission.getInputValue("title", true);
      customization.description = modalSubmission.getInputValue("description", true);
      customization.thumbnail = modalSubmission.getInputValue("thumbnail", true);
      customization.color = modalSubmission.getInputValue("color", true);

      await updatePreview();
      await modalSubmission.editOrReply({
        content: t.editVerification.previewUpdated,
        flags: MessageFlags.Ephemeral
      });
    });

    await ctx.modal(modal);
  }

  async saveVerification(ctx: CommandContext, customization: any, guild: Guild, t: any): Promise<void> {
    if (!customization.channelId) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.saveVerification.noChannelSelected,
      });
    }

    const channel = await ctx.client.channels.fetch(customization.channelId);
    if (!channel) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.saveVerification.channelNotFound,
      });
    }

    const verificationEmbed = this.createPreviewEmbed(customization, t);
    const verificationRow = new ActionRow().setComponents([
      new Button()
        .setCustomId(`verify_${ctx.guildId}`)
        .setLabel(t.buttons.verify)
        .setStyle(ButtonStyle.Primary),
    ]);

    if (guild.settings.verification.messageId) {
      try {
        const fetchChannel = await guild.channels.fetch(
          guild.settings.verification.channelId!
        );
        const oldMessage = fetchChannel
          ? await (fetchChannel as TextGuildChannel).messages.fetch(
              guild.settings.verification.messageId
            )
          : null;
        if (oldMessage) {
          await oldMessage.delete();
        }
      } catch (error: any) {
        if (error.code !== 10008) {
          console.error("Failed to delete old verification message:", error);
        }
      }
    } 

    const verificationMessage = await ctx.client.messages.write(channel.id, {
      embeds: [verificationEmbed],
      components: [verificationRow],
    });

    await guild.update({
      verification: {
        status: true,
        messageId: verificationMessage.id,
        ...customization,
      },
    });

    await ctx.editOrReply({
      content: t.saveVerification.messageSaved,
      components: [],
      embeds: []
    });
    return;
  }
}
