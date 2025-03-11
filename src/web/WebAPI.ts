import verification from "./handlers/verify";
import osugame from "./handlers/osugame";
import redirects from "./handlers/redirects";
import AokiClient from "../struct/Client";

interface Route {
  path: string;
  handler: (url: URL) => Promise<Response | string | object> | Response;
}

export default class AokiWebAPI {
  public client: AokiClient;
  private port: number;
  private verification: verification;
  private osugame: osugame;
  private redirects: redirects;
  private URI: string;
  private routes: Route[];

  constructor(client: AokiClient) {
    this.client = client;
    this.port = Number(process.env.PORT) || 3000;
    this.verification = new verification(client);
    this.osugame = new osugame(client);
    this.redirects = new redirects(client);

    this.URI = client.dev ? "http://localhost:8080" : "https://aoki.hackers.moe";

    this.routes = [
      { path: '/login', handler: (url: URL) => this.verification.handleLogin(url) },
      { path: '/callback', handler: (url: URL) => this.verification.handleCallback(url) },
      { path: '/osuedit', handler: (url: URL) => this.osugame.handleOsuEdit(url) },
      { path: '/osudirect', handler: (url: URL) => this.osugame.handleOsuDirect(url) },
      { path: '/verify', handler: (url: URL) => this.verification.verify(url) },
      { path: '/privacy', handler: () => this.redirects.handlePPRedirect() },
      { path: '/', handler: async () => "Why would you be here? I'll work on this later!" }
    ];
  }

  private async routeHandler(request: Request): Promise<Response> {
    const url = new URL(request.url, this.URI);
    const route = this.routes.find(r => r.path === url.pathname);
    
    if (route) {
      const result = await route.handler(url);
      // if the handler returns a Response, forward it
      if (result instanceof Response) {
        return result;
      }
      // return plain text if a string; otherwise, assume JSON
      if (typeof result === 'string') {
        return new Response(result, { headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  }

  serve(): void {
    Bun.serve({
      port: this.port,
      fetch: async (request: Request) => {
        return this.routeHandler(request);
      }
    });
  }
}
