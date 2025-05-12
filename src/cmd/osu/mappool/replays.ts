import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";

const options = {
  round: createStringOption({
    description: 'The round to view replays for',
    required: false,
    choices: [
      { name: 'Qualifiers', value: 'Qualifiers' },
      { name: 'Group Stage', value: 'Group Stage' },
      { name: 'Round of 32', value: 'Round of 32' },
      { name: 'Round of 16', value: 'Round of 16' },
      { name: 'Quarterfinals', value: 'Quarterfinals' },
      { name: 'Semifinals', value: 'Semifinals' },
      { name: 'Finals', value: 'Finals' },
      { name: 'Grand Finals', value: 'Grand Finals' }
    ]
  })
};

@Declare({
  name: 'replays',
  description: 'View saved replays for a specific round or the current mappool'
})
@Group('mappool')
@Options(options)
export default class Replays extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { round } = ctx.options;

    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: 'No tournament exists in this server. Create one with `/tourney make` first.'
      });
    }

    // Check permissions
    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.testReplayer
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to view replays. Only tournament organizers, advisors, and test/replayers can access this command.'
      });
    }

    const selectedRound = round || settings.currentRound;

    if (!selectedRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: 'No round is currently active, and no round was specified. Remind the organizer to set up the current round by doing `/tourney current`.'
      });
    }

    const mappool = settings.mappools.find(mp => mp.round === selectedRound);

    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No mappool found for the round: ${selectedRound}. Remind the organizer to set up the current mappool for this round by doing \`/tourney add-round\`.`
      });
    }

    if (!mappool.replays.length) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: `No replays have been saved for the round: ${selectedRound}.`
      });
    }

    const replyContent = `**Replays for ${selectedRound}:**\n` +
      mappool.replays
        .map(replay => `- [Replay for ${replay.slot}](${replay.messageUrl}) by **${replay.replayer}**`)
        .join('\n');

    await ctx.editOrReply({ content: replyContent });
  }
}