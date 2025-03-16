import { Subcommand } from "@struct/handlers/Subcommand";
import { 
  ChatInputCommandInteraction, 
  EmbedBuilder,
  TextChannel,
  AnySelectMenuInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ColorResolvable,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  MessageFlags
} from "discord.js";

interface Customization {
  verification: {
    title: string;
    thumbnail: string;
    description: string;
    roleId: string;
    channelId: string;
    color: string;
    status: boolean;
  };
}

export default class Customize extends Subcommand {
  constructor() {
    super({
      name: 'customize',
      description: 'Customize the verification message',
      permissions: ['ManageGuild'],
      options: []
    });
  };

  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    const guildSettings = i.guild!.settings;

    if (!guildSettings || !guildSettings.verification.status) {
      await i.editReply({ content: 'The verification system is disabled. Please enable it first.' });
      return;
    };

    let customization: Customization = {
      verification: {
        title: guildSettings?.verification.title || 'Verify your osu! account',
        thumbnail: guildSettings?.verification.thumbnail || i.guild!.iconURL() || "",
        description: guildSettings?.verification.description || 'Click the button below to verify your osu! account and gain access to the server.',
        roleId: guildSettings?.verification.roleId || '',
        channelId: guildSettings?.verification.channelId || '',
        color: guildSettings?.verification.color || '#FFFFFF',
        status: guildSettings?.verification.status || false
      }
    };

    const updatePreview = async (): Promise<void> => {
      const previewEmbed = this.createPreviewEmbed(customization);
      const row = this.createActionRow(i.guild!.id);
      const roleRow = this.createRoleSelectRow();
      const channelRow = this.createChannelSelectRow();

      await i.editReply({
        content: 'Preview of the verification message:',
        embeds: [previewEmbed],
        components: [row, roleRow, channelRow],
      });
    };

    await updatePreview();

    const message = await i.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 300000 }); // 5 minutes

    collector.on('collect', async (interaction: AnySelectMenuInteraction) => {
      if (interaction.customId === 'edit_verification') {
        await this.showEditModal(interaction, customization, updatePreview);
      } else if (interaction.customId === 'save_verification') {
        await this.saveVerification(interaction, customization);
        collector.stop();
      } else if (interaction.customId === 'select_role') {
        const role = await i.guild?.roles.fetch(interaction.values[0]);
        if (!role) {
          return await interaction.reply({ content: 'Selected role not found. Please try again.', flags: MessageFlags.Ephemeral });
        }
        if (role.position >= i.guild!.members.me!.roles.highest.position) {
          return await interaction.reply({ content: 'Baka, that role is higher than my highest role. I can\'t assign that to other users.', flags: MessageFlags.Ephemeral });
        }
        customization.verification.roleId = interaction.values[0];
        await interaction.reply({ content: `Verification role updated.`, flags: MessageFlags.Ephemeral });
        await updatePreview();
      } else if(interaction.customId === 'select_channel') {
        const channel = await i.guild?.channels.fetch(interaction.values[0]);
        if (!channel) {
          return await interaction.reply({ content: 'Selected channel not found. Please try again.', flags: MessageFlags.Ephemeral });
        }
        if (!channel.permissionsFor(i.client.user!)?.has(PermissionFlagsBits.SendMessages)) {
          await interaction.reply({ content: 'Baka, I can\'t send messages in there. Check the permissions you gave me.', flags: MessageFlags.Ephemeral });
          return;
        }
        customization.verification.channelId = interaction.values[0];
        await interaction.reply({ content: `Verification channel updated.`, flags: MessageFlags.Ephemeral });
        await updatePreview();
      }
    });

    collector.on('end', () => {
      i.editReply({ components: [] }).catch(console.error);
    });
  }

  createRoleSelectRow(): ActionRowBuilder<RoleSelectMenuBuilder> {
    return new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('select_role')
        .setPlaceholder('Select verification role')
        .setMinValues(1)
        .setMaxValues(1)
    );
  }

  createChannelSelectRow(): ActionRowBuilder<ChannelSelectMenuBuilder> {
    return new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('select_channel')
        .setPlaceholder('Select verification channel')
        .setChannelTypes(ChannelType.GuildText)
    );
  }

  createPreviewEmbed(customization: Customization): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(customization.verification.title || "Verify your osu! account")
      .setThumbnail(customization.verification.thumbnail || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setDescription(customization.verification.description || "Click the button below to verify your osu! account and gain access to the server.")
      .setColor(customization.verification.color as ColorResolvable || '#FFFFFF')
      .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` });
  }

  createActionRow(guildId: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('edit_verification')
        .setLabel('Edit')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('save_verification')
        .setLabel('Save')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`verify_${guildId}`)
        .setLabel('Verify (Preview)')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  async showEditModal(i: AnySelectMenuInteraction, customization: Customization, updatePreview: () => Promise<void>): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId('edit_verification_modal')
      .setTitle('Edit Verification Message');

    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Title')
      .setStyle(TextInputStyle.Short)
      .setValue(customization.verification.title || "Verify your osu! account")
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(customization.verification.description || "Click the button below to verify your osu! account and gain access to the server.")
      .setRequired(true);

    const thumbnailInput = new TextInputBuilder()
      .setCustomId('thumbnail')
      .setLabel('Thumbnail URL')
      .setStyle(TextInputStyle.Short)
      .setValue(customization.verification.thumbnail || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setRequired(false);

    const colorInput = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Embed Color (Hex Code)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7)
      .setValue(customization.verification.color || "#FFFFFF")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput)
    );

    await i.showModal(modal);

    try {
      const modalSubmission = await i.awaitModalSubmit({
        filter: (interaction: ModalSubmitInteraction) => interaction.customId === 'edit_verification_modal',
        time: 300000
      });

      customization.verification.title = modalSubmission.fields.getTextInputValue('title');
      customization.verification.description = modalSubmission.fields.getTextInputValue('description');
      customization.verification.thumbnail = modalSubmission.fields.getTextInputValue('thumbnail');
      customization.verification.color = modalSubmission.fields.getTextInputValue('color');

      await updatePreview();
      await modalSubmission.reply({ content: 'Preview updated. You can make more changes or save the configuration.', flags: MessageFlags.Ephemeral });
    } catch (error: any) {
      console.error('Modal submission error:', error);
      await i.followUp({ content: 'An error occurred while processing your input. Please try again.', flags: MessageFlags.Ephemeral }).catch(console.error);
    }
  }

  async saveVerification(i: AnySelectMenuInteraction, customization: Customization): Promise<void> {
    if (!customization.verification.channelId) {
      await i.reply({ content: 'Please select a channel for the verification message.', flags: MessageFlags.Ephemeral });
      return;
    }

    const channel = await i.guild?.channels.fetch(customization.verification.channelId);
    if (!channel) {
      await i.reply({ content: 'Selected channel not found. Please try again.', flags: MessageFlags.Ephemeral });
      return;
    }

    const verificationEmbed = this.createPreviewEmbed(customization);
    const verificationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_${i.guild!.id}`)
        .setLabel('Verify')
        .setStyle(ButtonStyle.Primary)
    );

    // check if there is already a message before
    // delete the old one to send the newer one
    if (i.guild?.settings?.verification.messageId) {
      try {
        const fetchChannel = i.guild?.channels.cache.get(i.guild.settings.verification.channelId!);
        const oldMessage = fetchChannel ? await (fetchChannel as TextChannel).messages.fetch(i.guild.settings?.verification.messageId) : null;
        if (oldMessage) {
          await oldMessage.delete();
        }
      } catch (error: any) {
        if (error.code !== 10008) { // 10008 is the error code for Unknown Message
          console.error('Failed to delete old verification message:', error);
        }
      }
    }

    const verificationMessage = await (channel as TextChannel).send({ embeds: [verificationEmbed], components: [verificationRow] });

    await i.guild!.update({
      ...customization,
      verification: {
        messageId: verificationMessage.id,
        ...customization.verification
      }
    });

    await i.reply({ content: 'Verification message saved and posted in the selected channel.\n\nPlease **DO NOT** delete the verification message. You\'ll have to set it up again.', flags: MessageFlags.Ephemeral });
  };
}
