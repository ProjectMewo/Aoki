import AokiClient from "../../struct/Client";

/**
 * Base class for all route handlers
 */
export default abstract class BaseHandler {
  protected client: AokiClient;

  /**
   * Create a new handler instance
   * @param client The AokiClient instance
   */
  constructor(client: AokiClient) {
    this.client = client;
  }

  /**
   * Create a successful JSON response
   * @param data The data to send as JSON
   * @param status The HTTP status code (default: 200)
   */
  protected jsonResponse(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Create a text response
   * @param text The text to send
   * @param status The HTTP status code (default: 200)
   */
  protected textResponse(text: string, status = 200): Response {
    return new Response(text, {
      status,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  /**
   * Create a redirect response
   * @param url The URL to redirect to
   * @param status The HTTP status code (default: 302)
   */
  protected redirectResponse(url: string, status = 302): Response {
    return new Response(null, {
      status,
      headers: { 'Location': url }
    });
  }

  /**
   * Create an error response
   * @param message The error message
   * @param status The HTTP status code (default: 400)
   */
  protected errorResponse(message: string, status = 400): Response {
    return this.textResponse(message, status);
  }
}