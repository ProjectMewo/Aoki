import verification from "./handlers/verify.js";
import osugame from "./handlers/osugame.js";
import redirects from "./handlers/redirects.js";

export default class AokiWebAPI {
  constructor(client) {
    this.client = client;
    this.port = Number(process.env.PORT) || 3000;
    this.verification = new verification(client);
    this.osugame = new osugame(client);
    this.redirects = new redirects(client);

    this.URI = client.dev ? "http://localhost:8080" : "https://aoki.hackers.moe";

    this.routes = [
      { path: '/login', handler: (url) => this.verification.handleLogin(url) },
      { path: '/callback', handler: (url) => this.verification.handleCallback(url) },
      { path: '/osuedit', handler: (url) => this.osugame.handleOsuEdit(url) },
      { path: '/osudirect', handler: (url) => this.osugame.handleOsuDirect(url) },
      { path: '/verify', handler: (url) => this.verification.verify(url) },
      { path: '/privacy', handler: () => this.redirects.handlePPRedirect() },
      { path: '/', handler: async () => "Why would you be here? I'll work on this later!" }
    ];
  }

  async routeHandler(request) {
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

  serve() {
    Bun.serve({
      port: this.port,
      fetch: async (request) => {
        return this.routeHandler(request);
      }
    });
  }
}
