import Command from '../struct/handlers/Command';
import { fun } from '../assets/import';
import { EmbedBuilder, Message } from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import Utilities from '../struct/Utilities';
import AokiClient from '../struct/Client';

export default new class Fun extends Command {
  private client!: AokiClient;
  constructor() {
    super({
      data: fun,
      permissions: [],
      cooldown: 0
    });
  };

  // 8ball command
  async "8ball"(i: ChatInputCommandInteraction, query: string, util: Utilities) {
    if (await util.isProfane(query)) return this.throw(i, "Fix your query, please. At least give me some respect!");
    const eightball = await util.getStatic("8ball");
    return await i.editReply({ content: util.random(eightball) });
  };

  // affirmation command
  async affirmation(i: ChatInputCommandInteraction) {
    await this.fetchAndSend(i, "https://www.affirmations.dev", "affirmation");
  };

  // advice command
  async advice(i: ChatInputCommandInteraction) {
    await this.fetchAndSend(i, "https://api.adviceslip.com/advice", "slip.advice");
  };

  // fact command
  async fact(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const urls = ["https://catfact.ninja/fact", "https://uselessfacts.jsph.pl/random.json?language=en"];
    const res = await fetch(util.random(urls)).then(res => res.json());
    const content = res.text || res.fact;
    await i.editReply({ content });
  };

  // today command
  async today(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const [month, day] = new Date().toLocaleDateString().trim().split("/");
    const todayRes = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
    const todayJs = await todayRes.json();
    const { text, year } = util.random(todayJs.data.Events);
    return await i.editReply({ content: `On **${todayJs.date}, ${year}**: ${text}` });
  };

  // ship command
  async ship(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const first = i.options.getUser("first")!;
    const second = i.options.getUser("second")!;
    if (first.id == util.id || second.id == util.id) return this.throw(i, "Ew, I'm not a fan of shipping. Choose someone else!");
    if (first.id == second.id) return this.throw(i, "Pfft. No one does that, baka.");

    const luckyWheelRate = util.probability(5);
    const rollProbability = util.probability(40);
    const result = rollProbability ? "100" : "0";
    const normalRate = Math.floor(Math.random() * 100);
    
    let finalShipResponse;
    if (normalRate == 0) {
      finalShipResponse = "Woah, that's impressive. I've never seen this happen before.\n\n||That's a **0%** ship rate, consider you two lucky.||";
    } else if (normalRate <= 30) {
      finalShipResponse = `You two stood no chance. I don't like **${normalRate}%**, and maybe you don't, too.`;
    } else if (normalRate <= 50) {
      finalShipResponse = `Fair, I'd say you two need some time. You two scored **${normalRate}%**, not like I like the rate or something.`;
    } else if (normalRate <= 70) {
      finalShipResponse = `Alright, that's fine. You two scored **${normalRate}%**, I think I like that.`;
    } else if (normalRate <= 99) {
      finalShipResponse = `Hey! That's pretty good, I rarely see a couple scoring this nicely. A whopping **${normalRate}%**!`;
    } else if (normalRate == 100) {
      finalShipResponse = "Holy cow. Perfect couple right here duh? **100%** ship rate!";
    };

    if (luckyWheelRate) {
      await i.editReply({ content: "Lucky wheel time! Let's see if you two are lucky!" });
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await i.editReply({ content: result == "100" ? "Hey, good couple! You rolled **100%**!" : "Baka, you two lost. **0%** rate." });
    };
    return await i.editReply({ content: finalShipResponse });
  };

  // fortune command
  async fortune(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const cookies = await util.getStatic("fortune");
    const cookie = util.random(cookies);
    await i.editReply({ content: cookie });
  };

  // truth command
  async truth(i: ChatInputCommandInteraction, _: string, util: Utilities) {
    const questions = await util.getStatic("truth");
    const question = util.random(questions);
    await i.editReply({ content: question });
  };

  // generator command
  async generator(i: ChatInputCommandInteraction) {
    const template = i.options.getString("template")!;
    const top = i.options.getString("top")!;
    const bottom = i.options.getString("bottom")!;
    
    const res = await fetch("https://api.imgflip.com/caption_image", {
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        template_id: template,
        username: "akira1922",
        password: process.env.IMG_KEY || "",
        text0: top,
        text1: bottom
      })
    }).then(async res => await res.json());

    const embed = this.embed
      .setDescription(`Here you go. Not like I wanted to waste my time.`)
      .setImage(res.data.url);
    await i.editReply({ embeds: [embed] });
  };

  // owo command
  async owo(i: ChatInputCommandInteraction, query: string) {
    const res = await fetch(`https://nekos.life/api/v2/owoify?text=${query}`).then(res => res.json());
    await i.editReply({ content: res.owo });
  };

  // internal utilities
  /**
   * Fetches an API, then sends a reply from the API data
   * @param {Object} i The command context
   * @param {String} url The URL of the API
   * @param {String} path The reply's object path
   */
  async fetchAndSend(i: ChatInputCommandInteraction, url: string, path: string): Promise<Message> {
    const res = await fetch(url).then(res => res.json());
    let data = path.split('.').reduce((acc, part) => acc[part], res);
    return await i.editReply({ content: data });
  };

  get embed() {
    return new EmbedBuilder()
      .setColor(10800862)
      .setFooter({ text: `Requested by ${this.client.user!.username}`, iconURL: this.client.user!.displayAvatarURL() })
      .setTimestamp();
  };
}
