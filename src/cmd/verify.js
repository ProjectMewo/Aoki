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
  PermissionFlagsBits
} from 'discord.js';
import Command from '../struct/handlers/Command';
import { verify } from '../assets/import';

export default new class VerifyCommand extends Command {
  constructor() {
    super({
      data: verify,
      permissions: [],
      cooldown: 0
    });
  };
  async toggle(i) {
    const guildSettings = i.guild.settings;
    const verificationEnabled = guildSettings?.verificationstatus || false;

    // disallow toggling if the verification message is not set
    if (!guildSettings?.verificationmessageid) {
      return i.reply('Please set the verification message and channel using `/verify customize` before enabling the feature.');
    };

    await i.guild.update({ 'verificationstatus': !verificationEnabled });

    const status = !verificationEnabled ? 'enabled' : 'disabled';
    if (verificationEnabled) {
      await i.reply(`Received your ticket. Verification feature has been ${status}.`);
    } else {
      await i.reply(`Received your ticket. Verification feature has been ${status}.\n\nIf this is your first time setting this up, please set the verification message and channel using \`/verify customize\`.`);
    }
  }

  async customize(i) {
    await i.deferReply({ flags: 64 });
    const guildSettings = i.guild.settings;

    let customization = guildSettings || {
      verificationtitle: 'Verify your osu! account',
      verificationthumbnail: i.guild.iconURL(),
      verificationdescription: 'Click the button below to verify your osu! account and gain access to the server.',
      verificationroleid: null,
      verificationchannelid: null
    };

    const updatePreview = async () => {
      const previewEmbed = this.createPreviewEmbed(customization);
      const row = this.createActionRow(i.guild.id);
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

    collector.on('collect', async (i) => {
      if (i.customId === 'edit_verification') {
        await this.showEditModal(i, customization, updatePreview);
      } else if (i.customId === 'save_verification') {
        await this.saveVerification(i, customization);
        collector.stop();
      } else if (i.customId === 'select_role') {
        const role = await i.guild.roles.fetch(i.values[0]);
        if (!role) {
          return await i.reply({ content: 'Selected role not found. Please try again.', flags: 64 });
        }
        if (role.position >= i.guild.members.me.roles.highest.position) {
          return await i.reply({ content: 'Baka, that role is higher than my highest role. I can\'t assign that to other users.', flags: 64 });
        }
        customization.verificationroleid = i.values[0];
        await i.reply({ content: `Verification role updated.`, flags: 64 });
        await updatePreview();
      } else if(i.customId === 'select_channel') {
        const channel = await i.guild.channels.fetch(i.values[0]);
        if (!channel) {
          return await i.reply({ content: 'Selected channel not found. Please try again.', flags: 64 });
        }
        if (!channel.permissionsFor(i.client.user).has(PermissionFlagsBits.SendMessages)) {
          await i.reply({ content: 'Baka, I can\'t send messages in there. Check the permissions you gave me.', flags: 64 });
          return;
        }
        customization.verificationchannelid = i.values[0];
        await i.reply({ content: `Verification channel updated.`, flags: 64 });
        await updatePreview();
      }
    });

    collector.on('end', () => {
      i.editReply({ components: [] }).catch(console.error);
    });
  }

  createRoleSelectRow() {
    return new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId('select_role')
        .setPlaceholder('Select verification role')
        .setMinValues(1)
        .setMaxValues(1)
    );
  }

  createChannelSelectRow() {
    return new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('select_channel')
        .setPlaceholder('Select verification channel')
        .setChannelTypes(ChannelType.GuildText)
    );
  }

  createPreviewEmbed(customization) {
    return new EmbedBuilder()
      .setTitle(customization.verificationtitle || "Verify your osu! account")
      .setThumbnail(customization.verificationthumbnail || "https://cdn.discordapp.com/embed/avatars/0.png")
      .setDescription(customization.verificationdescription || "Click the button below to verify your osu! account and gain access to the server.")
      .setColor(customization.verificationcolor || '#FFFFFF')
      .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` });
  }

  createActionRow(guildId) {
    return new ActionRowBuilder().addComponents(
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

  async showEditModal(i, customization, updatePreview) {
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
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(thumbnailInput),
      new ActionRowBuilder().addComponents(colorInput)
    );

    await i.showModal(modal);

    try {
      const modalSubmission = await i.awaitModalSubmit({
        filter: i => i.customId === 'edit_verification_modal',
        time: 300000
      });

      customization.verificationtitle = modalSubmission.fields.getTextInputValue('title');
      customization.verificationdescription = modalSubmission.fields.getTextInputValue('description');
      customization.verificationthumbnail = modalSubmission.fields.getTextInputValue('thumbnail');
      customization.verificationcolor = modalSubmission.fields.getTextInputValue('color');

      await updatePreview();
      await modalSubmission.reply({ content: 'Preview updated. You can make more changes or save the configuration.', flags: 64 });
    } catch (error) {
      console.error('Modal submission error:', error);
      await i.followUp({ content: 'An error occurred while processing your input. Please try again.', flags: 64 }).catch(console.error);
    }
  }

  async saveVerification(i, customization) {
    if (!customization.verificationchannelid) {
      await i.reply({ content: 'Please select a channel for the verification message.', flags: 64 });
      return;
    }

    const channel = await i.guild.channels.fetch(customization.verificationchannelid);
    if (!channel) {
      await i.reply({ content: 'Selected channel not found. Please try again.', flags: 64 });
      return;
    }

    const verificationEmbed = this.createPreviewEmbed(customization);
    const verificationRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_${i.guild.id}`)
        .setLabel('Verify')
        .setStyle(ButtonStyle.Primary)
    );

    // check if there is already a message before
    // delete the old one to send the newer one
    if (i.guild.settings?.verificationmessageid) {
      try {
        const fetchChannel = i.guild.channels.cache.get(i.guild.settings?.verificationchannelid);
        const oldMessage = fetchChannel ? await fetchChannel.messages.fetch(i.guild.settings?.verificationmessageid) : null;
        if (oldMessage) {
          await oldMessage.delete();
        }
      } catch (error) {
        if (error.code !== 10008) { // 10008 is the error code for Unknown Message
          console.error('Failed to delete old verification message:', error);
        }
      }
    }

    const verificationMessage = await channel.send({ embeds: [verificationEmbed], components: [verificationRow] });

    await i.guild.update({
      ...customization,
      verificationmessageid: verificationMessage.id,
      verificationstatus: true
    });

    await i.reply({ content: 'Verification message saved and posted in the selected channel.\n\nPlease **DO NOT** delete the verification message. You\'ll have to set it up again.', flags: 64 });
  };
}