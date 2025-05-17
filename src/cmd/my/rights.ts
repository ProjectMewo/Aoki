import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  SubCommand, 
  Options, 
  createStringOption, 
  createBooleanOption,
  LocalesT,
  AutocompleteInteraction
} from "seyfert";

const options = {
  to: createStringOption({
    description: 'what permission to configure',
    description_localizations: {
      "en-US": 'what permission to configure',
      "vi": 'quyền mà cậu muốn cấu hình'
    },
    required: true,
    autocomplete: async (interaction) => await Rights.prototype.autocomplete(interaction)
  }),
  should_be: createBooleanOption({
    description: 'whether I should do it or not',
    description_localizations: {
      "en-US": 'whether I should do it or not',
      "vi": 'liệu tớ có nên làm điều đó hay không'
    },
    required: true
  })
};

@Declare({
  name: 'rights',
  description: 'configure your personal privacy settings'
})
@LocalesT('my.rights.name', 'my.rights.description')
@Options(options)
export default class Rights extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.my.rights.choices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).my.rights;
    const query: string = ctx.options.to.toLowerCase();
    const value: boolean = ctx.options.should_be;
    const settings = ctx.author.settings;
    
    // all discord returned option values are lowercased
    const properQuery: { [key: string]: string } = {
      processmessagepermission: t.readProcess,
      saveosuuseraccount: t.saveOsu
    };

    if (settings[query as keyof typeof settings] == value) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.isCurrent(value, properQuery[query])
      });
    }

    const res = await ctx.author.update({ [query]: value });

    if (res[query as keyof typeof res] == value) {
      await ctx.write({ content: t.set(value, properQuery[query]) });
    } else {
      return AokiError.DATABASE({
        sender: ctx.interaction, 
        content: t.apiError
      });
    }
  }
}
