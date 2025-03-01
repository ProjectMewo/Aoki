// some methods here does not belong to a command
// it's for splitting up functions for fixing in the future
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  MessageFlags,
  ColorResolvable,
  AnySelectMenuInteraction
} from "discord.js";
import Command from '../struct/handlers/Command';
import { verify } from '../assets/import';

interface Customization {
  verificationtitle?: string;
  verificationthumbnail?: string;
  verificationdescription?: string;
  verificationroleid?: string | null;
  verificationchannelid?: string | null;
  verificationcolor?: string;
  verificationstatus?: boolean;
  verificationmessageid?: string;
}

export default new class VerifyCommand extends Command {
  constructor() {
    super({
      data: verify,
      permissions: [],
      cooldown: 0
    });
  };
  async toggle(i: ChatInputCommandInteraction): Promise<void> {
    const guildSettings = (i.guild as any).settings;
    const verificationEnabled = guildSettings?.verificationstatus || false;

    // disallow toggling if the verification message is not set
    if (!guildSettings?.verificationmessageid) {
      await i.reply('Please set the verification message and channel using `/verify customize` before enabling the feature.');
      return;
    };

    await (i.guild as any).update({ 'verificationstatus': !verificationEnabled });

    const status = !verificationEnabled ? 'enabled' : 'disabled';
    if (verificationEnabled) {
      await i.reply(`Received your ticket. Verification feature has been ${status}.`);
    } else {
      await i.reply(`Received your ticket. Verification feature has been ${status}.\n\nIf this is your first time setting this up, please set the verification message and channel using \`/verify customize\`.`);
    }
  }

  async customize(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ flags: 64 });
    const guildSettings = (i.guild as any).settings;

    let customization: Customization = guildSettings || {
      verificationtitle: 'Verify your osu! account',
      verificationthumbnail: i.guild!.iconURL() || "",
      verificationdescription: 'Click the button below to verify your osu! account and gain access to the server.',
      verificationroleid: null,
      verificationchannelid: null
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
          return await interaction.reply({ content: 'Selected role not found. Please try again.', flags: 64 });
        }
        if (role.position >= i.guild!.members.me!.roles.highest.position) {
          return await interaction.reply({ content: 'Baka, that role is higher than my highest role. I can\'t assign that to other users.', flags: 64 });
        }
        customization.verificationroleid = interaction.values[0];
        await interaction.reply({ content: `Verification role updated.`, flags: 64 });
        await updatePreview();
      } else if(interaction.customId === 'select_channel') {
        const channel = await i.guild?.channels.fetch(interaction.values[0]);
        if (!channel) {
          return await interaction.reply({ content: 'Selected channel not found. Please try again.', flags: 64 });
        }
        if (!channel.permissionsFor(i.client.user!)?.has(PermissionFlagsBits.SendMessages)) {
          await interaction.reply({ content: 'Baka, I can\'t send messages in there. Check the permissions you gave me.', flags: 64 });
          return;
        }
        customization.verificationchannelid = interaction.values[0];
        await interaction.reply({ content: `Verification channel updated.`, flags: 64 });
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
      .setTitle(customization.verificationtitle || "Verify your osu! account")
      .setThumbnail(customization.verificationthumbnail || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setDescription(customization.verificationdescription || "Click the button below to verify your osu! account and gain access to the server.")
      .setColor(customization.verificationcolor as ColorResolvable || '#FFFFFF')
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
      .setValue(customization.verificationtitle || "Verify your osu! account")
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(customization.verificationdescription || "Click the button below to verify your osu! account and gain access to the server.")
      .setRequired(true);

    const thumbnailInput = new TextInputBuilder()
      .setCustomId('thumbnail')
      .setLabel('Thumbnail URL')
      .setStyle(TextInputStyle.Short)
      .setValue(customization.verificationthumbnail || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setRequired(false);

    const colorInput = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Embed Color (Hex Code)')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(7)
      .setValue(customization.verificationcolor || "#FFFFFF")
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

      customization.verificationtitle = modalSubmission.fields.getTextInputValue('title');
      customization.verificationdescription = modalSubmission.fields.getTextInputValue('description');
      customization.verificationthumbnail = modalSubmission.fields.getTextInputValue('thumbnail');
      customization.verificationcolor = modalSubmission.fields.getTextInputValue('color');

      await updatePreview();
      await modalSubmission.reply({ content: 'Preview updated. You can make more changes or save the configuration.', flags: 64 });
    } catch (error: any) {
      console.error('Modal submission error:', error);
      await i.followUp({ content: 'An error occurred while processing your input. Please try again.', flags: 64 }).catch(console.error);
    }
  }

  async saveVerification(i: AnySelectMenuInteraction, customization: Customization): Promise<void> {
    if (!customization.verificationchannelid) {
      await i.reply({ content: 'Please select a channel for the verification message.', flags: MessageFlags.Ephemeral as any });
      return;
    }

    const channel = await i.guild?.channels.fetch(customization.verificationchannelid);
    if (!channel) {
      await i.reply({ content: 'Selected channel not found. Please try again.', flags: MessageFlags.Ephemeral as any });
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
    if ((i.guild as any).settings?.verificationmessageid) {
      try {
        const fetchChannel = i.guild?.channels.cache.get(i.guild.settings.verificationchannelid);
        const oldMessage = fetchChannel ? await (fetchChannel as any).messages.fetch((i.guild as any).settings?.verificationmessageid) : null;
        if (oldMessage) {
          await oldMessage.delete();
        }
      } catch (error: any) {
        if (error.code !== 10008) { // 10008 is the error code for Unknown Message
          console.error('Failed to delete old verification message:', error);
        }
      }
    }

    const verificationMessage = await (channel as any).send({ embeds: [verificationEmbed], components: [verificationRow] });

    await (i.guild as any).update({
      ...customization,
      verificationmessageid: verificationMessage.id,
      verificationstatus: true
    });

    await i.reply({ content: 'Verification message saved and posted in the selected channel.\n\nPlease **DO NOT** delete the verification message. You\'ll have to set it up again.', flags: 64 });
  };
}
