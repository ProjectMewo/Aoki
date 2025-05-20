import { AutocompleteInteraction } from "seyfert";

/**
 * Set up an autocomplete interaction with localized choices
 * @param interaction `AutocompleteInteraction`
 * @param localizedChoices choices localized as an array of name and value
 * @param focusedValue the focused value of the autocomplete
 * @returns {Promise<void>}
 */
const respondWithLocalizedChoices = async (
  interaction: AutocompleteInteraction,
  localizedChoices: { name: string; value: string }[]
): Promise<void> => {
  const choices = localizedChoices;
  const focusedValue = interaction.options.getAutocompleteValue()

  if (!focusedValue) {
    return await interaction.respond(choices);
  }

  const filteredChoices = choices.filter(choice =>
    choice.name.toLowerCase().includes(focusedValue.toLowerCase())
  ).slice(0, 25);

  await interaction.respond(filteredChoices);
};

declare module 'seyfert' {
  interface SubCommand {
    respondWithLocalizedChoices(
      interaction: AutocompleteInteraction,
      localizedChoices: { name: string; value: string }[]
    ): Promise<void>
  }
  interface Command {
    respondWithLocalizedChoices(
      interaction: AutocompleteInteraction,
      localizedChoices: { name: string; value: string }[]
    ): Promise<void>
  }
};

export { respondWithLocalizedChoices };