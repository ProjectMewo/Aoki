import { CommandContext, Declare, SubCommand } from "seyfert";

@Declare({
	name: "ping",
	description: "see if I respond."
})
export default class Ping extends SubCommand {
	run(ctx: CommandContext) {
		const latency = ctx.client.gateway.latency;

		return ctx.write({
			content: `yo, my ping is around **${latency}ms**.`
		});
	}
}
