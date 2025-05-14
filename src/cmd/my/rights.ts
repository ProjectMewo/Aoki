import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";
import AokiError from "@struct/handlers/AokiError";

export default class Rights extends Subcommand {
  constructor() {
    super({
      name: 'rights',
      description: 'configure your personal privacy settings',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'to',
          description: 'what permission to configure',
          required: true,
          choices: [
            { name: 'read & process your messages', value: 'processMessagePermission' },
            { name: 'save your osu! account details on verification', value: 'saveOsuUserAccount' }
          ]
        },
        {
          type: 'boolean',
          name: 'should_be',
          description: 'whether I should do it or not',
          required: true
        }
      ]
    });
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    const query: string = i.options.getString("to")!.toLowerCase();
    const value: boolean = i.options.getBoolean("should_be")!;
    const settings = i.user.settings;
    
    if (settings[query as keyof typeof settings] == value) {
      return AokiError.GENERIC({
        sender: i,
        content: `Baka, that's your current settings.`
      });
    }
    
    const res = await i.user.update({ [query]: value });
    
    const properQuery: { [key: string]: string } = {
      processMessagePermission: "read & process your messages",
      saveOsuUserAccount: "save your osu! account details on verification"
    };
    
    if (res[query as keyof typeof res] == value) {
      await i.reply({ content: `Alright, I ${value ? "will" : "won't"} **${properQuery[query]}**.` });
    } else {
      return AokiError.DATABASE({
        sender: i,
        content: "The database might be having problems. Try executing this again."
      });
    }
  }
}