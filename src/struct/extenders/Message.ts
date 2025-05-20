import AokiClient from "@struct/Client";
import { Message, DefaultLocale } from "seyfert";

const t = function(this: Message & { client: AokiClient }): DefaultLocale {
  const clientT = this.client.t(this.client.langs.defaultLang ?? 'en-US');
  return clientT.get(this.user.settings.language);
};

declare module 'seyfert' {
  interface Message {
    t: DefaultLocale
  }
};

export { t };