import fs from "fs";
import crypto from "crypto";
import archiver from "archiver";

type MappoolMap = {
  url: string;
  slot: string;
};

type Options = {
  maps: MappoolMap[];
  client: {
    s3: Bun.S3Client;
    requestV2Token: () => Promise<string | null>;
  };
  extractDifficultyId: (url: string) => string;
  fetchBeatmapInfo: (diffId: string) => Promise<any>;
  r2PublicBaseURL: string;
};

/**
 * Utility class for osu!-specific operations
 */
export default class OsuUtil {
  public rankEmotes: { [key: string]: string };

  constructor() {
    this.rankEmotes = {
      XH: "<:xh:1184870634124226620>", X: "<:x:1184870631372750871>",
      SH: "<:sh:1184870626394128518>", S: "<:s:1184870621109297162>",
      A: "<:a:1184870604843778170>", B: "<:b:1184870609470095442>",
      C: "<:c:1184870613421150258>", D: "<:d:1184870615572824154>",
      F: "<:f_:1184872548337451089>"
    };
  }

  /**
   * Format numerical osu! mode to its string equivalent
   * @param {Number} int The number to convert to mode name
   * @returns {String}
   */
  public stringModeFormat(int: number): string {
    return ["osu", "taiko", "fruits", "mania"][int];
  }

  /**
   * Format string osu! mode to its numerical equivalent
   * @param {String} str Mode string to convert
   * @returns {Number}
   */
  public numberModeFormat(str: string): number {
    if (str == "osu") return 0;
    if (str == "taiko") return 1;
    if (str == "fruits") return 2;
    if (str == "mania") return 3;
    else return Number(str);
  }

  /**
   * Generates or fetches a mappack ZIP file containing beatmaps based on the provided maps.
   * If the mappack already exists in the S3 bucket, its public URL is returned.
   * Otherwise, the mappack is created, uploaded to S3, and its public URL is returned.
   *
   * @param options - The options for generating or fetching the mappack.
   * @param options.maps - An array of mappool maps containing URLs and slots.
   * @param options.client - The S3 client used for file operations.
   * @param options.extractDifficultyId - A function to extract the difficulty ID from a map URL.
   * @param options.fetchBeatmapInfo - A function to fetch beatmap information using the difficulty ID.
   * @param options.r2PublicBaseURL - The base URL for accessing public files in the S3 bucket.
   * @returns {Promise<string>} Promise resolving to the URL of the file
   */
  public async generateOrFetchMappack({
    maps,
    client,
    extractDifficultyId,
    fetchBeatmapInfo,
    r2PublicBaseURL
  }: Options): Promise<string> {
    const normalizeMappool = (maps: MappoolMap[]) =>
      maps
        .map(map => ({
          url: map.url.trim(),
          slot: map.slot.trim().toUpperCase()
        }))
        .sort((a, b) => a.slot.localeCompare(b.slot));

    const getMappoolHash = (maps: MappoolMap[]) => {
      const normalized = normalizeMappool(maps);
      const hash = crypto.createHash("sha256");
      hash.update(JSON.stringify(normalized));
      return hash.digest("hex");
    };

    const hash = getMappoolHash(maps);
    const zipKey = `${hash}.zip`;
    const file = client.s3.file(zipKey);
    const publicURL = `${r2PublicBaseURL}/${zipKey}`;
    if (await file.exists()) {
      return publicURL;
    }

    const tmpPath = `/tmp/${hash}.zip`;
    const output = fs.createWriteStream(tmpPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);

    for (const map of maps) {
      const diffId = extractDifficultyId(map.url);
      const beatmap = await fetchBeatmapInfo(diffId);
      if (!beatmap) continue;

      const filename = `${map.slot} - ${beatmap.beatmapset.artist_unicode} - ${beatmap.beatmapset.title} [${beatmap.version}].osz`;

      try {
        const fileRes = await fetch(`https://api.nerinyan.moe/d/${beatmap.beatmapset.id}`);

        const buffer = await fileRes.arrayBuffer();
        archive.append(Buffer.from(buffer), { name: filename });
      } catch (err) {
        console.error(`Failed to fetch .osz for ${filename}`, err);
      }
    }

    await archive.finalize();
    await new Promise<void>(resolve => output.on("close", () => resolve()));

    const zipFile = Bun.file(tmpPath);
    await client.s3.write(zipKey, zipFile, { type: "application/zip" });

    fs.unlinkSync(tmpPath);

    return publicURL;
  }
}