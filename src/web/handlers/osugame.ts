import AokiClient from "../../struct/Client";

export default class osugame {
  public client: AokiClient;
  public constructor(client: AokiClient) {
    this.client = client;
  }

  public handleOsuEdit(url: URL) {
    const params = url.searchParams;
    // only redirect to edit route
    let osuUrl = "osu://";

    const time = params.get('time');
    const timeRegex = /^(\d{2}):(\d{2}):(\d{3})$/;

    if (time) {
      if (timeRegex.test(time)) {
        osuUrl += `edit/${time}`;
      } else {
        return new Response("Invalid time format. Expected format: MM:SS:mmm", {
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    } else {
      return new Response("Missing time value", {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response(null, {
      status: 302,
      headers: { Location: osuUrl.toString() }
    });
  }

  public handleOsuDirect(url: URL) {
    const params = url.searchParams;
    const mapId = params.get('id');
    if (!mapId) {
      return new Response("Invalid or missing ID", {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const osuDirectUrl = `osu://dl/${mapId}`;

    return new Response(null, {
      status: 302,
      headers: { Location: osuDirectUrl }
    });
  }
}
