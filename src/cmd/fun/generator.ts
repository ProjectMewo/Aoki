import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createStringOption, 
  Declare, 
  Embed,
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  template: createStringOption({
    description: 'the template ID to use',
    required: true,
    autocomplete: async (interaction) => {
      const focused = interaction.options.getAutocompleteValue();
      const filteredTemplates = Generator.templates
        .filter(t => t.id.includes(focused ?? '') && t.lines === 2)
        .slice(0, 20);

      await interaction.respond(
        filteredTemplates.map(t => ({ name: t.name, value: t.id }))
      );
    }
  }),
  top: createStringOption({
    description: 'the top text of the meme',
    required: true
  }),
  bottom: createStringOption({
    description: 'the bottom text of the meme',
    required: true
  })
};

@Declare({
  name: 'generator',
  description: 'generate a meme using a template.'
})
@Options(options)
export default class Generator extends SubCommand {
  public static templates: Array<{ id: string, name: string, lines: number }> = [];

  static async initializeTemplates(): Promise<void> {
    if (this.templates.length === 0) {
      this.templates = await fetch("https://api.memegen.link/templates")
        .then(res => res.json())
        .catch(() => []);
    }
  }

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { template, top, bottom } = ctx.options;

    await ctx.deferReply();

    try {
      const response = await fetch(`https://api.memegen.link/images/${template}/${encodeURIComponent(top)}/${encodeURIComponent(bottom)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch meme image.");
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      const attachment = {
        data: imageBuffer,
        filename: 'meme.png'
      };

      const embed = new Embed()
        .setColor(10800862)
        .setDescription("Here you go. Not like I wanted to waste my time.")
        .setImage("attachment://meme.png")
        .setFooter({
          text: `Requested by ${ctx.interaction.user.username}`,
          iconUrl: ctx.author.avatarURL()
        })
        .setTimestamp(new Date());

      await ctx.editOrReply({
        embeds: [embed],
        files: [attachment]
      });
    } catch (error) {
      AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Failed to generate the meme. Please try again later."
      });
    }
  }
}

// Initialize templates when the bot starts
Generator.initializeTemplates();
