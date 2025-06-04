// Update some Interaction/Message classes to support localization out-of-the-box
// Usage: [interactionClass].t
import AokiClient from "@struct/Client";
import { AutocompleteInteraction, ButtonInteraction, ChatInputCommandInteraction, Message, DefaultLocale } from "seyfert";

// autocomplete interaction
// this is for serving localized options for choices
const tAutocomplete = function(this: AutocompleteInteraction & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this?.locale ?? this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

// button interaction
// this is for the verification feature when the user clicks
const tButton = function(this: ButtonInteraction & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this?.locale ?? this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

// chat input command
// reduce redundancy of us having to provide this with user set locale
const tChatInput = function(this: ChatInputCommandInteraction & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this?.locale ?? this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

// message
// this is for the message events
const tMessage = function(this: Message & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

// module augmentation
declare module 'seyfert' {
  interface AutocompleteInteraction {
    t: DefaultLocale;
  }
  interface ButtonInteraction {
    t: DefaultLocale;
  }
  interface ChatInputCommandInteraction {
    t: DefaultLocale;
  }
  interface Message {
    t: DefaultLocale;
  }
}

export { tAutocomplete, tButton, tChatInput, tMessage };
