import AokiError from "@struct/AokiError";
import {
  CommandContext,
  createRoleOption,
  createStringOption,
  Declare,
  Group,
  Options,
  SubCommand
} from "seyfert";

const options = {
  roleset: createStringOption({
    description: 'the roleset to add the role to (e.g., host, advisor, mappooler)',
    required: true,
    choices: [
      { name: 'Host', value: 'host' },
      { name: 'Advisor', value: 'advisor' },
      { name: 'Mappooler', value: 'mappooler' },
      { name: 'Tester/Replayer', value: 'testReplayer' },
      { name: 'Custom Mapper', value: 'customMapper' },
      { name: 'Streamer', value: 'streamer' }
    ]
  }),
  role: createRoleOption({
    description: 'the role to add to the selected roleset',
    required: true
  })
};

@Declare({
  name: 'add-role',
  description: 'add additional roles to a tournament roleset'
})
@Group('tourney')
@Options(options)
export default class AddRole extends SubCommand {
  async run(ctx: CommandContext<typeof options>): Promise<void> {
    const { roleset, role } = ctx.options;

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

    // Check permission - only hosts can add roles to this tournament
    const permittedRoles = settings.roles.host;
    const userRoles = (await ctx.interaction.member!.roles.list()).map(role => role.id);
    const hasPermittedRole = permittedRoles.some(roleId => userRoles.includes(roleId));

    if (!hasPermittedRole) {
      return AokiError.PERMISSION({
        sender: ctx.interaction,
        content: 'You do not have permission to add roles to rolesets. Only hosts can do this.'
      });
    }

    // Validate roleset
    if (!(roleset in settings.roles)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `Invalid roleset: **${roleset}**. Please choose a valid roleset.`
      });
    }

    // Check if the role is already added
    if (settings.roles[roleset as keyof typeof settings.roles].includes(role.id)) {
      return AokiError.USER_INPUT({
        sender: ctx.interaction,
        content: `The role <@&${role.id}> is already part of the **${roleset}** roleset.`
      });
    }

    // Add the role to the roleset
    settings.roles[roleset as keyof typeof settings.roles].push(role.id);

    // Update guild settings
    await guild.update({
      tournament: settings
    });

    await ctx.editOrReply({
      content: `Successfully added role <@&${role.id}> to the **${roleset}** roleset!`
    });
  }
}
