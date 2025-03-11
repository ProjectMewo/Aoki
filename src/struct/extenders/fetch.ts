// This is a more special file
// It overwrites the fetch function in globalThis to cache responses,
// which we can't use the Extender class to overwrite it,
// as globalThis is an object.
// By default, the ttl of each cached response is a minute.

interface CachedResponse {
  body: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  expiresAt: number;
}

const originalFetch = globalThis.fetch;
const cache = new Map<string, CachedResponse>();
const TTL = 60 * 1000;

function getCacheKey(input: RequestInfo | URL, init: RequestInit = {}): string {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return JSON.stringify({ url, init });
}

globalThis.fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const cacheKey = getCacheKey(input, init);

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() > cached.expiresAt) {
      cache.delete(cacheKey);
    } else {
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
      });
    }
  }

  const response = await originalFetch(input, init);
  const responseClone = response.clone();
  const body = await responseClone.text();
  const headers: Record<string, string> = {};
  responseClone.headers.forEach((value, key) => {
    headers[key] = value;
  });

  cache.set(cacheKey, {
    body,
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers,
    expiresAt: Date.now() + TTL,
  });

  return response;
};
