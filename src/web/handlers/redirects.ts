import BaseHandler from "./BaseHandler";

/**
 * Handler for redirection routes
 */
export default class RedirectsHandler extends BaseHandler {
  /**
   * Handle privacy policy redirect
   */
  public handlePrivacyPolicyRedirect(): Response {
    return this.redirectResponse("https://github.com/ProjectMewo/Terms-and-Policy/blob/main/Privacy%20Policy.md");
  }
}
