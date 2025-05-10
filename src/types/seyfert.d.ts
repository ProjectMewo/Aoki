import { ParseClient, Client } from "seyfert";
import AokiClient from "@struct/Client";

declare module 'seyfert' {
  interface UsingClient extends ParseClient<AokiClient> {}
}
