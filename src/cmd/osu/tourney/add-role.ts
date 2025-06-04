import { meta } from "@assets/cmdMeta";
import AokiError from "@struct/AokiError";
import {
  AutocompleteInteraction,
  CommandContext,
  createRoleOption,
  createStringOption,
  Declare,
  Group,
  Locales,
  Options,
  SubCommand
} from "seyfert";

const options = {
  roleset: createStringOption({
    description: 'the roleset to add the role to (e.g., host, advisor, mappooler)',
    description_localizations: meta.osu.tourney.add_role.roleset,
    required: true,
    autocomplete: async i => await AddRole.prototype.autocomplete(i)
  }),
  role: createRoleOption({
    description: 'the role to add to the selected roleset',
    description_localizations: meta.osu.tourney.add_role.role,
    required: true
  })
};

@Declare({
  name: 'add-role',
  description: 'add additional roles to a tournament roleset'
})
@Locales(meta.osu.tourney.add_role.loc)
@Group('tourney')
@Options(options)
export default class AddRole extends SubCommand {
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    await this.respondWithLocalizedChoices(
      interaction,
      interaction.t.osu.tourney.addRole.choices
    );
  };

  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const t = ctx.t.get(ctx.interaction.user.settings.language).osu.tourney.addRole;
    const { roleset, role } = ctx.options;

    await ctx.deferReply();

    // Fetch tournament settings
    const guild = await ctx.client.guilds.fetch(ctx.guildId!);
    const settings = guild.settings.tournament;
    if (!settings.name) {
      return AokiError.NOT_FOUND({
        sender: ctx.interaction,
        content: t.noTournament
      });
    }

    // Check permission - only hosts can add roles to this tournament
    const permittedRoles = settings.roles.host;
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: t.noPermission
      });
    }

    // Check if the role is already added
    if (settings.roles[roleset as keyof typeof settings.roles].includes(role.id)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: t.roleAlreadyAdded(role.id, roleset)
      });
    }

    // Add the role to the roleset
    settings.roles[roleset as keyof typeof settings.roles].push(role.id);

    // Update guild settings
    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: t.roleAdded(role.id, roleset)
    });
  }
}
