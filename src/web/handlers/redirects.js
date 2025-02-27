export default class redirects {
  constructor(client) {
    this.client = client;
  };
  // redirect to our privacy policy
  handlePPRedirect() {
    const redirectUrl = new URL("https://github.com/AokiOfficial/Terms-and-Policy/blob/main/Privacy%20Policy.md");
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl.toString() }
    });
  };
}