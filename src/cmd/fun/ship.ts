import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createUserOption, 
  Declare, 
  SubCommand, 
  Options 
} from "seyfert";

const options = {
  first: createUserOption({
    description: 'the first user to ship',
    required: true
  }),
  second: createUserOption({
    description: 'the second user to ship',
    required: true
  })
}

@Declare({
  name: 'ship',
  description: 'ship two users together and see their compatibility.'
})
@Options(options)
export default class Ship extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { first, second } = ctx.options;

    // Check if user is trying to ship with the bot
    if (first.id === ctx.client.me!.id || second.id === ctx.client.me!.id) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Ew, I'm not a fan of shipping. Choose someone else!"
      });
    }

    // Check if user is shipping themselves
    if (first.id === second.id) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: "Pfft. No one does that, baka."
      });
    }

    // Lucky wheel logic (5% chance)
    const luckyWheelRate = ctx.client.utils.array.probability(5);
    if (luckyWheelRate) {
      const rollProbability = ctx.client.utils.array.probability(40);
      const result = rollProbability ? "100" : "0";

      await ctx.write({ content: "Lucky wheel time! Let's see if you two are lucky!" });
      await new Promise(resolve => setTimeout(resolve, 3000));
      await ctx.editOrReply({ 
        content: result === "100" ? 
          "Hey, good couple! You rolled **100%**!" : 
          "Baka, you two lost. **0%** rate." 
      });
      return;
    }

    // Normal ship rate logic
    const normalRate = Math.floor(Math.random() * 100);
    let finalShipResponse;

    if (normalRate === 0) {
      finalShipResponse = "Woah, that's impressive. I've never seen this happen before.\n\n||That's a **0%** ship rate, consider you two lucky.||";
    } else if (normalRate <= 30) {
      finalShipResponse = `You two stood no chance. I don't like **${normalRate}%**, and maybe you don't, too.`;
    } else if (normalRate <= 50) {
      finalShipResponse = `Fair, I'd say you two need some time. You two scored **${normalRate}%**, not like I like the rate or something.`;
    } else if (normalRate <= 70) {
      finalShipResponse = `Alright, that's fine. You two scored **${normalRate}%**, I think I like that.`;
    } else if (normalRate <= 99) {
      finalShipResponse = `Hey! That's pretty good, I rarely see a couple scoring this nicely. A whopping **${normalRate}%**!`;
    } else if (normalRate === 100) {
      finalShipResponse = "Holy cow. Perfect couple right here duh? **100%** ship rate!";
    }

    await ctx.write({ content: finalShipResponse });
  }
}
