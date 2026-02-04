// Basic cache-first service worker for All Image Tools

const CACHE_NAME = "all-image-tools-LJ-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return (
        cacheRes ||
        fetch(event.request)
          .then(fetchRes => {
            const clone = fetchRes.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
            return fetchRes;
          })
          .catch(() => caches.match("/index.html"))
      );
    })
  );
});
