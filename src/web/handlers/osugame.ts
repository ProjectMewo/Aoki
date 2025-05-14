import BaseHandler from "./BaseHandler";

/**
 * Handler for osu! protocol-related routes
 */
export default class OsuGameHandler extends BaseHandler {
  /**
   * Handle osu! editor protocol links
   * @param url The request URL
   */
  public handleOsuEdit(url: URL): Response {
    const time = url.searchParams.get('time');
    const timeRegex = /^(\d{2}):(\d{2}):(\d{3})$/;

    if (!time) {
      return this.errorResponse("Missing time value");
    }

    if (!timeRegex.test(time)) {
      return this.errorResponse("Invalid time format. Expected format: MM:SS:mmm");
    }

    return this.redirectResponse(`osu://edit/${time}`);
  }

  /**
   * Handle osu! direct download protocol links
   * @param url The request URL
   */
  public handleOsuDirect(url: URL): Response {
    const mapId = url.searchParams.get('id');
    
    if (!mapId) {
      return this.errorResponse("Invalid or missing ID");
    }

    return this.redirectResponse(`osu://dl/${mapId}`);
  }
}
