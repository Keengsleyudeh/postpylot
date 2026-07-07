const CACHE_VERSION = "postpylot-pwa-v1";

const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

const STATIC_PREFIXES = ["/_next/static/", "/icons/"];

const SKIP_PATHS = ["/auth/callback"];

/**
 * @param {string} url
 */
function shouldSkipRequest(url) {
  if (url.includes("supabase.co")) return true;
  return SKIP_PATHS.some((path) => url.includes(path));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (shouldSkipRequest(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match("/offline.html").then(
            (cached) =>
              cached ??
              new Response("You are offline.", {
                status: 503,
                headers: { "Content-Type": "text/plain" },
              })
          )
        )
    );
    return;
  }

  const isStatic = STATIC_PREFIXES.some((prefix) =>
    url.pathname.startsWith(prefix)
  );

  if (isStatic || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached ?? networkFetch;
        })
      )
    );
  }
});
