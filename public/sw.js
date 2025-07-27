// This is the "Offline page" service worker for BE STRONG

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "bestrong-offline-v2";
const STATIC_CACHE = "bestrong-static-v1";

// Page de fallback hors ligne
const offlineFallbackPage = "offline.html";

// Ressources à mettre en cache
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-512-maskable.png',
  '/icon-512-any.png',
  '/icon-maskable.png',
  '/icon.png'
];

self.addEventListener("message", (event) => { 
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((cache) => cache.add(offlineFallbackPage)),
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_RESOURCES))
    ])
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') { 
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  } else if (event.request.destination === 'image' || 
             event.request.destination === 'style' || 
             event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
}); 