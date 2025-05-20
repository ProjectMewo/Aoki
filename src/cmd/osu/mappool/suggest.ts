import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createBooleanOption,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  slot: createStringOption({
    description: 'the slot to suggest this map to',
    description_localizations: {
      "en-US": 'the slot to suggest this map to',
      "vi": 'slot mà cậu muốn đề xuất map này'
    },
    required: true
  }),
  url: createStringOption({
    description: 'the beatmap URL (must include difficulty ID)',
    description_localizations: {
      "en-US": 'the beatmap URL (must include difficulty ID)',
      "vi": 'URL của beatmap (phải bao gồm ID độ khó)'
    },
    required: true
  }),
  confirm: createBooleanOption({
    description: 'confirm you know the correct current round is set',
    description_localizations: {
      "en-US": 'confirm you know the correct current round is set',
      "vi": 'xác nhận rằng cậu biết vòng hiện tại đã được đặt đúng'
    },
    required: true
  })
};

@Declare({
  name: 'suggest',
  description: 'suggest a new map for this mappool slot.'
})
@Locales({
  name: [
    ['en-US', 'suggest'],
    ['vi', 'đề-xuất']
  ],
  description: [
    ['en-US', 'suggest a new map for this mappool slot.'],
    ['vi', 'đề xuất một map mới cho slot mappool này.']
  ]
})
@Group('mappool')
@Options(options)
export default class Suggest extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.mappool.suggest;
    const { slot, url, confirm } = ctx.options;

    if (!confirm) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.confirmPrompt
      });
    }

    await ctx.deferReply();

    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;

    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    const permittedRoles = [
      ...settings.roles.host,
      ...settings.roles.advisor,
      ...settings.roles.mappooler,
      ...settings.roles.testReplayer
    ];
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    const { currentRound, mappools } = settings;

    if (!currentRound) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.noActiveRound
      });
    }

    const mappool = mappools.find(mp => mp.round === currentRound);

    if (!mappool) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noMappool(currentRound)
      });
    }

    if (!mappool.slots.includes(slot)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidSlot(slot, mappool.slots, currentRound)
      });
    }

    const fullUrlPattern = /^https?:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#(?:osu|taiko|fruits|mania)\/\d+$/i;
    const shortUrlPattern = /^https?:\/\/osu\.ppy\.sh\/b\/\d+$/i;

    if (!fullUrlPattern.test(url) && !shortUrlPattern.test(url)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.invalidUrl
      });
    }

    let suggestion = mappool.suggestions.find(s => s.slot === slot);
    if (!suggestion) {
      suggestion = { slot, urls: [] };
      mappool.suggestions.push(suggestion);
    }

    if (!suggestion.urls.includes(url)) {
      suggestion.urls.push(url);

      await guild.update({
        tournament: settings
      });

      await ctx.editOrReply({
        content: t.suggestionAdded(slot, currentRound)
      });
    } else {
      await ctx.editOrReply({
        content: t.alreadySuggested(slot)
      });
    }
  }
}
