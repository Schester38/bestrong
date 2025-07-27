// This is the "Offline page" service worker for BE STRONG

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "bestrong-offline-v3";
const STATIC_CACHE = "bestrong-static-v2";

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
  '/icon.png',
  '/screenshot1.png',
  '/screenshot2.png',
  '/screenshot3.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((cache) => {
        console.log('Caching offline page');
        return cache.add(offlineFallbackPage);
      }),
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
    ])
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Gestion des messages
self.addEventListener("message", (event) => { 
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activation du preload si supporté
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Gestion des requêtes
self.addEventListener('fetch', (event) => {
  console.log('Fetch event for:', event.request.url);
  
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
        console.log('Navigation failed, serving offline page');
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