import AokiError from "@struct/handlers/AokiError";
import { Subcommand } from "@struct/handlers/Subcommand";
import { ChatInputCommandInteraction } from "discord.js";

export default class Set extends Subcommand {
  private usernameRegex: RegExp;
  private baseUrl: string;
  private api_v1: string;
  
  constructor() {
    super({
      name: 'set',
      description: 'set your osu! username and default mode',
      permissions: [],
      options: [
        {
          type: 'string',
          name: 'username',
          description: 'your osu! username',
          required: true
        },
        {
          type: 'string',
          name: 'mode',
          description: 'your preferred mode',
          required: true,
          choices: [
            { name: 'osu!standard', value: 'osu' },
            { name: 'osu!taiko', value: 'taiko' },
            { name: 'osu!catch', value: 'fruits' },
            { name: 'osu!mania', value: 'mania' }
          ]
        }
      ]
    });
    
    this.usernameRegex = /^[\[\]a-z0-9_-\s]+$/i;
    this.baseUrl = "https://osu.ppy.sh";
    this.api_v1 = `${this.baseUrl}/api`;
  }
  
  async execute(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    const user = i.options.getString("username")!;
    const mode = i.client.utils.osu.numberModeFormat(i.options.getString("mode")!);
    
    // handle exceptions
    const settings = i.user.settings;
    if (!settings) await i.user.update({ inGameName: "", defaultMode: 0 });
    if (!this.usernameRegex.test(user)) {
      ("Baka, the username is invalid.");
    }
    
    const profile = await this.findUserByUsername(i, user, i.client.utils.osu.stringModeFormat(mode));
    if (!profile?.username) {
      return AokiError.NOT_FOUND({
        sender: i,
        content: "Baka, that user doesn't exist."
      });
    }
    
    // utilities
    const replies = ["Got that.", "Noted.", "I'll write that in.", "Updated for you.", "One second, writing that in.", "Check if this is right."];
    const reply = `${i.client.utils.array.random(replies)} Your current username is \`${profile.username}\`, and your current mode is \`${i.client.utils.osu.stringModeFormat(mode)}\`.`;
    
    // database check
    if (
      settings.defaultMode && /* entry exists in db */
      settings.inGameName == profile.username && /* ign is the same */
      settings.defaultMode == mode /* mode is the same */
    ) {
      // We don't need to get to the database to save it again
      await i.editReply(`${reply}\n\nThat's the same thing you did before, though.`);
      return;
    }
    
    // save to database
    await i.user.update({ inGameName: profile.username, defaultMode: mode });
    await i.editReply({ content: reply });
  }
  
  async findUserByUsername(i: ChatInputCommandInteraction, username: string, mode: string) {
    return (await fetch([
      `${this.api_v1}/get_user?`,
      `k=${process.env["OSU_KEY"]!}&`,
      `u=${username}&`,
      `m=${i.client.utils.osu.numberModeFormat(mode)}`
    ].join(""))
    .then(async res => await res.json()))[0];
  }
}