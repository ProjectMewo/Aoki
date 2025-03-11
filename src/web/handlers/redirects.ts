import AokiClient from "../../struct/Client";

export default class redirects {
  public client: AokiClient;
  constructor(client: AokiClient) {
    this.client = client;
  };
  // redirect to our privacy policy
  public handlePPRedirect() {
    const redirectUrl = new URL("https://github.com/ProjectMewo/Terms-and-Policy/blob/main/Privacy%20Policy.md");
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() }
    });
  };
}
