import VerificationHandler from "./handlers/verify";
import OsuGameHandler from "./handlers/osugame";
import RedirectsHandler from "./handlers/redirects";
import AokiClient from "../struct/Client";

/**
 * Route definition interface
 */
interface Route {
  path: string;
  handler: (url: URL) => Promise<Response> | Response;
  method?: string;
}

/**
 * Main web API server for Aoki
 */
export default class AokiWebAPI {
  // @ts-ignore
  private client: AokiClient;
  private port: number;
  // @ts-ignore
  private baseUrl: string;
  private routes: Route[];

  // Handler instances
  private verificationHandler: VerificationHandler;
  private osuGameHandler: OsuGameHandler;
  private redirectsHandler: RedirectsHandler;

  /**
   * Create a new web API server
   * @param client The AokiClient instance
   */
  constructor(client: AokiClient) {
    this.client = client;
    this.port = Number(process.env.PORT) || 3000;
    this.baseUrl = client.dev ? "http://localhost:8080" : "https://aoki.hackers.moe";
    
    // Initialize handlers
    this.verificationHandler = new VerificationHandler(client);
    this.osuGameHandler = new OsuGameHandler(client);
    this.redirectsHandler = new RedirectsHandler(client);

    // Define routes
    this.routes = [
      // Verification routes
      { 
        path: '/verify', 
        handler: (url) => this.verificationHandler.verify(url)
      },
      { 
        path: '/login', 
        handler: (url) => this.verificationHandler.handleLogin(url) 
      },
      {
        path: '/callback', 
        handler: (url) => this.verificationHandler.handleCallback(url)
      },
      
      // osu! protocol routes
      {
        path: '/osuedit',
        handler: (url) => this.osuGameHandler.handleOsuEdit(url)
      },
      {
        path: '/osudirect',
        handler: (url) => this.osuGameHandler.handleOsuDirect(url)
      },
      
      // Redirect routes
      {
        path: '/privacy',
        handler: () => this.redirectsHandler.handlePrivacyPolicyRedirect()
      },
      
      // Home route
      {
        path: '/',
        handler: () => new Response("Baka, what're you trying to do here?\n\nOh, if you're free, check out https://project-mewo.vercel.app.", {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    ];
  }

  /**
   * Handle incoming HTTP requests
   * @param request The HTTP request
   */
  private async handleRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const route = this.routes.find(r => r.path === url.pathname);
      
      // Handle 404 for undefined routes
      if (!route) {
        return new Response('Not Found', { status: 404 });
      }

      // Method checking (if specified)
      if (route.method && request.method !== route.method) {
        return new Response('Method Not Allowed', { status: 405 });
      }

      // Call the route handler
      return await route.handler(url);
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Start the web server
   */
  public serve(): void {
    Bun.serve({
      port: this.port,
      fetch: (request) => this.handleRequest(request)
    });
  }
}
