import AokiError from "@struct/AokiError";
import { 
  CommandContext, 
  createUserOption, 
  Declare, 
  SubCommand, 
  Options, 
  LocalesT
} from "seyfert";

const options = {
  first: createUserOption({
    description: 'the first user to ship',
    description_localizations: {
      "en-US": 'the first user to ship',
      "vi": 'người đầu tiên cậu muốn ghép đôi'
    },
    required: true
  }),
  second: createUserOption({
    description: 'the second user to ship',
    description_localizations: {
      "en-US": 'the second user to ship',
      "vi": 'người thứ hai cậu muốn ghép đôi'
    },
    required: true
  })
}

@Declare({
  name: 'ship',
  description: 'ship two users together and see their compatibility.'
})
@LocalesT('fun.ship.name', 'fun.ship.description')
@Options(options)
export default class Ship extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).fun.ship;
    const { first, second } = ctx.options;

    // Check if user is trying to ship with the bot
    if (first.id === ctx.client.me!.id || second.id === ctx.client.me!.id) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.botShip
      });
    }

    // Check if user is shipping themselves
    if (first.id === second.id) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.selfShip
      });
    }

    // Lucky wheel logic (5% chance)
    const luckyWheelRate = ctx.client.utils.array.probability(5);
    if (luckyWheelRate) {
      const rollProbability = ctx.client.utils.array.probability(40);
      const result = rollProbability ? "100" : "0";

      await ctx.write({ content: t.luckyWheel.start });
      await new Promise(resolve => setTimeout(resolve, 3000));
      await ctx.editOrReply({ 
        content: result === "100" ? 
          t.luckyWheel.success : 
          t.luckyWheel.failure
      });
      return;
    }

    // Normal ship rate logic
    const normalRate = Math.floor(Math.random() * 100);
    const finalShipResponse = t.response(normalRate);

    await ctx.write({ content: finalShipResponse });
  }
}
