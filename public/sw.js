const CACHE_VERSION = "v1"
const STATIC_CACHE = `pomodoro-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `pomodoro-dynamic-${CACHE_VERSION}`

const PRECACHE_ROUTES = ["/timer", "/tasks", "/stats", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ROUTES).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n !== STATIC_CACHE && n !== DYNAMIC_CACHE)
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET and same-origin
  if (request.method !== "GET" || url.origin !== location.origin) return

  // API routes: network-only (never cache)
  if (url.pathname.startsWith("/api/")) return

  // Next.js static chunks: cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()))
            }
            return res
          })
      )
    )
    return
  }

  // Pages: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()))
          }
          return res
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})
