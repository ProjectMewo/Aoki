import { CommandContext, Declare, LocalesT, SubCommand } from "seyfert";

@Declare({
	name: "ping",
	description: "see if I respond."
})
@LocalesT('my.ping.name', 'my.ping.description')
export default class Ping extends SubCommand {
	async run(ctx: CommandContext) {
		const latency = ctx.client.gateway.latency;

		const replies = await ctx.client.utils.profane.getStatic("ping");

    const reply = ctx.client.utils.array.random(replies)
      .replace(/{{user}}/g, ctx.author.username)
      .replace(/{{ms}}/g, Math.round(latency).toString());

		await ctx.write({ content: reply });
	}
}
