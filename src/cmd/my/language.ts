import { 
  CommandContext, 
  Declare, 
  SubCommand, 
  Options, 
  createStringOption,
  Locales,
  AutocompleteInteraction
} from "seyfert";
const options = {
  language: createStringOption({
    description: 'the language you want me to speak',
    description_localizations: {
      "en-US": 'the language you want me to speak',
      "vi": 'ngôn ngữ cậu muốn tớ dùng để phản hồi'
    },
    required: true,
    autocomplete: async i => await Language.prototype.autocomplete(i)
  })
}

@Declare({
  name: 'language',
  description: 'configure the language you want me to speak to you'
})
@Locales({
  name: [
    ['en-US', 'language'],
    ['vi', 'ngôn-ngữ']
  ],
  description: [
    ['en-US', 'configure the language you want me to speak to you'],
    ['vi', 'cấu hình ngôn ngữ tớ sẽ dùng để phản hồi']
  ]
})
@Options(options)
export default class Language extends SubCommand {
  async autocomplete(i: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      i,
      i.t.my.language.choices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const language = ctx.options.language as typeof ctx.author.settings.language;
    
    await ctx.author.update({ language });

    // Only get t after we set the language
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.language;
    
    await ctx.write({ content: t.response });
  }
}
