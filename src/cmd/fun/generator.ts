import { Subcommand } from "@struct/handlers/Subcommand";
import { AttachmentBuilder, AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

// We place this here so we don't spam the API every time the
// user types something in the autocomplete.
// This will fetch the templates once and store them in the variable.
const res = await fetch("https://api.memegen.link/templates").then(res => res.json()) as Array<{ id: string, name: string, lines: number }>;

export default class Generator extends Subcommand {
  constructor() {
    super({
      name: 'generator',
      description: 'generate a meme using a template.',
      permissions: [],
      // reminds me of discord.js before builders existed
      options: [
        {
          type: 'string',
          name: 'template',
          description: 'the template ID to use',
          isAutocomplete: true,
          required: true
        },
        {
          type: 'string',
          name: 'top',
          description: 'the top text of the meme',
          required: true
        },
        {
          type: 'string',
          name: 'bottom',
          description: 'the bottom text of the meme',
          required: true
        }
      ]
    });
  };

  async autocomplete(i: AutocompleteInteraction): Promise<void> {
    // Get the focused option
    const focused = i.options.getFocused();
    // If the user hasn't typed anything, we'll just send the templates
    if (!focused) {
      return await i.respond(
        res.map((t: { id: string, name: string }) => (
          { name: t.name, value: t.id }
        )) || []
      );
    }
    // Filter the templates based on the user's input
    // We also only want the ones with 2 "lines" 
    // (as in top and bottom text)
    const templates = res.filter((t: { id: string, name: string, lines: number }) => t.id.includes(focused) && t.lines === 2);
    // Send the response
    await i.respond(
      templates.map((t: { id: string, name: string }) => (
        { name: t.name, value: t.id }
      )) || []
    );
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    // Get options from the interaction
    const template = i.options.getString("template")!;
    const top = i.options.getString("top")!;
    const bottom = i.options.getString("bottom")!;
    
    // Fetch the meme from the API
    const res = await fetch(`https://api.memegen.link/images/${template}/${top}/${bottom}`).then(res => res.arrayBuffer());
    // The URL returns a raw image, so we have to make an attachment
    const imageBuffer = Buffer.from(new Uint8Array(res));
    const attachment = new AttachmentBuilder(imageBuffer, { 
      name: 'meme.png' 
    });

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(10800862)
      .setDescription(`Here you go. Not like I wanted to waste my time.`)
      .setImage("attachment://meme.png")
      .setFooter({ text: `Requested by ${i.user.username}`, iconURL: i.user.displayAvatarURL() })
      .setTimestamp();

    // Send the generated meme
    await i.editReply({ embeds: [embed], files: [attachment] });
  };
}