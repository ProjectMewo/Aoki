import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  Declare, 
  SubCommand, 
  Options, 
  createStringOption, 
  createBooleanOption
} from "seyfert";
const options = {
  to: createStringOption({
    description: 'what permission to configure',
    required: true,
    choices: [
      { name: 'read & process your messages', value: 'processMessagePermission' },
      { name: 'save your osu! profile details on verification', value: 'saveOsuUserAccount' }
    ]
  }),
  should_be: createBooleanOption({
    description: 'whether I should do it or not',
    required: true
  })
}

@Declare({
  name: 'rights',
  description: 'configure your personal privacy settings'
})
@Options(options)
export default class Rights extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const query: string = ctx.options.to.toLowerCase();
    const value: boolean = ctx.options.should_be;
    const settings = ctx.author.settings;
    
    if (settings[query as keyof typeof settings] == value) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `Baka, that's your current settings.`
      });
    }
    
    const res = await ctx.author.update({ [query]: value });
    
    const properQuery: { [key: string]: string } = {
      processMessagePermission: "read & process your messages",
      saveOsuUserAccount: "save your osu! profile details on verification"
    };
    
    if (res[query as keyof typeof res] == value) {
      await ctx.write({ content: `Alright, I ${value ? "will" : "won't"} **${properQuery[query]}**.` });
    } else {
      return AokiError.DATABASE({
        sender: ctx.interaction, 
        content: "The database might be having problems. Try executing this again."
      });
    }
  }
}
