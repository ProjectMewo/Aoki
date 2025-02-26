// This is a more special file
// It overwrites the fetch function in globalThis to cache responses,
// which we can't use the Extender class to overwrite it, 
// as globalThis is an object.
// By default, the ttl of each cached response is a minute.
const originalFetch = globalThis.fetch;
const cache = new Map();
const TTL = 60 * 1000;

function getCacheKey(input, init = {}) {
  const url = typeof input === "string" ? input : input.url;
  return JSON.stringify({ url, init });
}

globalThis.fetch = async (input, init = {}) => {
  const cacheKey = getCacheKey(input, init);

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
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
  const headers = {};
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