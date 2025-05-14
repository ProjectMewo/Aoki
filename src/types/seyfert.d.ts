import { ParseClient, Client, ParseLocales, extendContext } from "seyfert";
import AokiClient from "@struct/Client";
import type English from '../locales/en-US';

declare module 'seyfert' {
  interface UsingClient extends ParseClient<AokiClient> { }
  interface DefaultLocale extends ParseLocales<typeof English> { }
}
