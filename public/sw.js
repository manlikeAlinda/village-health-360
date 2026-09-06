// Runtime-caching service worker for offline app-shell access.
//
// Scope deliberately excludes the backend API (a different origin, and API
// responses are already handled by the IndexedDB layer in app/lib/offlineDb.ts
// + app/lib/syncEngine.ts, which understands merge/conflict semantics that a
// blind HTTP cache does not). This worker only caches same-origin GET
// requests — the Next.js page shell, JS/CSS bundles, and static assets —
// so the app itself still loads with no network.

const CACHE_NAME = "vh360-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only same-origin GET requests are candidates for offline caching.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || Response.error()))
  );
});
