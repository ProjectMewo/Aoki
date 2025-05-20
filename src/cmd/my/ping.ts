import { CommandContext, Declare, Locales, SubCommand } from "seyfert";

@Declare({
	name: "ping",
	description: "see if I respond."
})
@Locales({
	name: [
		['en-US', 'ping'],
		['vi', 'kiểm-tra']
	],
	description: [
		['en-US', 'see if I respond.'],
		['vi', 'kiểm tra xem tớ có phản hồi không.']
	]
})
export default class Ping extends SubCommand {
	async run(ctx: CommandContext) {
		const latency = ctx.client.gateway.latency;

		const replies = ctx.t.get(ctx.interaction.user.settings.language).my.ping.responses;

		const reply = ctx.client.utils.array.random(replies)
			.replace(/{{user}}/g, ctx.author.username)
			.replace(/{{ms}}/g, Math.round(latency).toString());

		await ctx.write({ content: reply });
	}
}
