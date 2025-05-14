import AokiClient from "@struct/Client";
import { ChatInputCommandInteraction, DefaultLocale } from "seyfert";

const t = function(this: ChatInputCommandInteraction & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this?.locale ?? this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

declare module 'seyfert' {
  interface ChatInputCommandInteraction {
    t: DefaultLocale
  }
};

export { t };