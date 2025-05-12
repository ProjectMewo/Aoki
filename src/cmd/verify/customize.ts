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
  SelectMenuInteraction
} from "seyfert";
import { 
  ButtonStyle, 
  MessageFlags, 
  PermissionFlagsBits, 
  TextInputStyle 
} from "seyfert/lib/types";

@Declare({
  name: "customize",
  description: "Customize the verification message",
})
export default class Customize extends SubCommand {
  async run(ctx: CommandContext): Promise<void> {
    await ctx.deferReply(true);

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const me = await guild.members.fetch(ctx.client.botId);
    const settings = guild.settings.verification;

    if (!settings?.status) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: "The verification system is disabled. Please enable it first.",
      });
    }

    const customization = {
      title: settings.title || "Verify your osu! account",
      thumbnail: settings.thumbnail || guild.iconURL() || "",
      description:
        settings.description ||
        "Click the button below to verify your osu! account and gain access to the server.",
      roleId: settings.roleId || "",
      channelId: settings.channelId || "",
      color: ctx.client.utils.string.hexToColorResolvable(settings.color || "#FFFFFF"),
    };

    const updatePreview = async (): Promise<WebhookMessage> => {
      const previewEmbed = this.createPreviewEmbed(customization);
      const actionRow = this.createActionRow();
      const roleRow = this.createRoleSelectRow();
      const channelRow = this.createChannelSelectRow();

      const message = await ctx.editOrReply({
        content: "Preview of the verification message:",
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
      await this.showEditModal(interaction, customization, updatePreview);
    });

    collector.run("save_verification", async () => {
      await this.saveVerification(ctx, customization, guild);
      collector.stop();
    });

    collector.run("select_role", async (interaction: RoleSelectMenuInteraction) => {
      const role = (await guild.roles.list()).find(r => r.id === interaction.values[0]);
      if (!role) {
        return interaction.editOrReply({
          content: "Selected role not found. Please try again.",
          flags: MessageFlags.Ephemeral
        });
      }
      const botHighestRole = await me.roles.highest();
      if (role.position >= botHighestRole.position) {
        return interaction.editOrReply({
          content: "Baka, that role is higher than my highest role. I can't assign that to other users.",
          flags: MessageFlags.Ephemeral
        });
      }
      customization.roleId = interaction.values[0];
      await interaction.editOrReply({
        content: "Verification role updated.",
        flags: MessageFlags.Ephemeral
      });
      await updatePreview();
    });

    collector.run("select_channel", async (interaction: ChannelSelectMenuInteraction) => {
      const channel = await guild.channels.fetch(interaction.values[0]);
      if (!channel) {
        return interaction.editOrReply({
          content: "Selected channel not found. Please try again",
          flags: MessageFlags.Ephemeral
        });
      }
      if (!(await me.fetchPermissions()).has([PermissionFlagsBits.SendMessages])) {
        return interaction.editOrReply({
          content: "Baka, I can't send messages in there. Enable **Send Messages** in permissions view, please",
          flags: MessageFlags.Ephemeral
        });
      }
      customization.channelId = interaction.values[0];
      await interaction.editOrReply({
        content: "Verification channel updated.",
        flags: MessageFlags.Ephemeral
      });
      await updatePreview();
    });
  }

  createRoleSelectRow(): ActionRow<RoleSelectMenu> {
    return new ActionRow<RoleSelectMenu>().setComponents([
      new RoleSelectMenu()
        .setCustomId("select_role")
        .setPlaceholder("Select verification role")
    ]);
  }

  createChannelSelectRow(): ActionRow<ChannelSelectMenu> {
    return new ActionRow<ChannelSelectMenu>().setComponents([
      new ChannelSelectMenu()
        .setCustomId("select_channel")
        .setPlaceholder("Select verification channel")
    ]);
  }

  createPreviewEmbed(customization: any) {
    return {
      title: customization.title,
      thumbnail: { url: customization.thumbnail },
      description: customization.description,
      color: customization.color,
      footer: { text: `Last updated: ${new Date().toLocaleString()}` },
    };
  }

  createActionRow(): ActionRow {
    return new ActionRow().setComponents([
      new Button()
        .setCustomId("edit_verification")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),
      new Button()
        .setCustomId("save_verification")
        .setLabel("Save")
        .setStyle(ButtonStyle.Success),
    ]);
  }

  async showEditModal(
    ctx: SelectMenuInteraction,
    customization: any,
    updatePreview: () => Promise<WebhookMessage>
  ): Promise<void> {
    const titleInput = new TextInput()
      .setCustomId("title")
      .setLabel("Title")
      .setStyle(TextInputStyle.Short)
      .setValue(customization.title)
      .setRequired(true);

    const descriptionInput = new TextInput()
      .setCustomId("description")
      .setLabel("Description")
      .setStyle(TextInputStyle.Paragraph)
      .setValue(customization.description)
      .setRequired(true);

    const thumbnailInput = new TextInput()
      .setCustomId("thumbnail")
      .setLabel("Thumbnail URL")
      .setStyle(TextInputStyle.Short)
      .setValue(customization.thumbnail)
      .setRequired(false);

    const colorInput = new TextInput()
      .setCustomId("color")
      .setLabel("Embed Color (Hex Code)")
      .setStyle(TextInputStyle.Short)
      .setValue(customization.color)
      .setRequired(false);

    const modal = new Modal()
      .setCustomId("edit_verification_modal")
      .setTitle("Edit Verification Message")
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
        content:
          "Preview updated. You can make more changes or save the configuration.\n\nPlease note: Due to my sensei's privacy-focused practice, *every* verification message will include this paragraph:\n> *You can opt-out from having your osu! profile information collected by me by doing* \`/my rights [to:save your osu! profile details] [should_be:False]\` ***before** starting to verify.*",
        flags: MessageFlags.Ephemeral
      });
    });

    await ctx.modal(modal);
  }

  async saveVerification(ctx: CommandContext, customization: any, guild: Guild): Promise<void> {
    if (!customization.channelId) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: "Please select a channel for the verification message.",
      });
    }

    const channel = await ctx.client.channels.fetch(customization.channelId);
    if (!channel) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: "Selected channel not found. Please try again.",
      });
    }
    
    customization.description +=
      `\n\n*You can opt-out from having your osu! profile information collected by me by doing* \`/my rights [to:save your osu! profile details] [should_be:False]\` ***before** starting to verify.*`

    const verificationEmbed = this.createPreviewEmbed(customization);
    const verificationRow = new ActionRow().setComponents([
      new Button()
        .setCustomId(`verify_${ctx.guildId}`)
        .setLabel("Verify")
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
      content:
        "Verification message saved and posted in the selected channel.\n\nPlease **DO NOT** delete the verification message. You'll have to set it up again.",
      components: [],
      embeds: []
    });
    return;
  }
}
