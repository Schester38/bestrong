// Service Worker optimisé pour BE STRONG PWA
const CACHE_NAME = 'be-strong-v2.2';
const STATIC_CACHE = 'be-strong-static-v2.2';
const DYNAMIC_CACHE = 'be-strong-dynamic-v2.2';
const API_CACHE = 'be-strong-api-v2.2';

// Ressources à mettre en cache immédiatement
const STATIC_RESOURCES = [
  '/',
  '/offline.html',
  '/icon-512.png',
  '/icon-512-maskable.png',
  '/icon-512-any.png',
  '/icon.png',
  '/manifest.json',
  '/browserconfig.xml'
];

// Pages importantes à mettre en cache
const IMPORTANT_PAGES = [
  '/dashboard',
  '/inscription',
  '/help'
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  API: 'network-first',
  IMAGES: 'cache-first',
  PAGES: 'network-first'
};

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Cache des ressources statiques');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Cache des icônes et images
      caches.open('images').then((cache) => {
        return cache.addAll([
          '/icon-512.png',
          '/icon-512-maskable.png',
          '/icon-512-any.png',
          '/icon.png'
        ]);
      }),

      // Cache des pages importantes
      caches.open('pages').then((cache) => {
        return cache.addAll(IMPORTANT_PAGES);
      })
    ]).then(() => {
      console.log('Service Worker: Installation terminée');
      return self.skipWaiting();
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE &&
              cacheName !== 'images' &&
              cacheName !== 'pages') {
            console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes de développement
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }
  
  // Stratégie pour les API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Stratégie pour les images
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Stratégie pour les ressources statiques
  if (isStaticResource(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Stratégie pour les pages importantes
  if (isImportantPage(request)) {
    event.respondWith(handleImportantPageRequest(request));
    return;
  }
  
  // Stratégie par défaut pour les pages
  event.respondWith(handlePageRequest(request));
});

// Gestion des requêtes API
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Essayer le réseau en premier pour les API
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache la réponse pour une utilisation future
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Erreur API, utilisation du cache:', error);
    
    // Essayer de récupérer depuis le cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner une réponse d'erreur
    return new Response(JSON.stringify({ 
      error: 'Service indisponible',
      message: 'Vérifiez votre connexion internet'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Gestion des requêtes d'images
async function handleImageRequest(request) {
  const cache = await caches.open('images');
  
  // Essayer le cache en premier
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Si pas en cache, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retourner une image par défaut si erreur
    return cache.match('/icon-512.png');
  }
}

// Gestion des ressources statiques
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Essayer le cache en premier
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Si pas en cache, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retourner la page offline
    return cache.match('/offline.html');
  }
}

// Gestion des pages importantes
async function handleImportantPageRequest(request) {
  const cache = await caches.open('pages');
  
  try {
    // Essayer le réseau en premier
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache pour une utilisation future
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Erreur page importante, utilisation du cache:', error);
    
    // Essayer de récupérer depuis le cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner la page offline
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Page non disponible hors ligne');
  }
}

// Gestion des requêtes de pages
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Essayer le réseau en premier
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Mettre en cache pour une utilisation future
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Erreur page, utilisation du cache:', error);
    
    // Essayer de récupérer depuis le cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retourner la page offline
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Page non disponible hors ligne');
  }
}

// Fonctions utilitaires
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/i.test(request.url);
}

function isStaticResource(request) {
  return request.destination === 'style' || 
         request.destination === 'script' ||
         request.destination === 'font' ||
         /\.(css|js|woff|woff2|ttf|eot|json|xml)$/i.test(request.url);
}

function isImportantPage(request) {
  return IMPORTANT_PAGES.some(page => request.url.includes(page));
}

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATED') {
    // Nettoyer les anciens caches
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
  console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Synchroniser les données en arrière-plan
    console.log('Service Worker: Synchronisation en arrière-plan');
    
    // Ici vous pouvez ajouter la logique de synchronisation
    // Par exemple, synchroniser les tâches, messages, etc.
    
  } catch (error) {
    console.error('Service Worker: Erreur de synchronisation:', error);
  }
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification BE STRONG',
      icon: '/icon-512.png',
      badge: '/icon-512.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Voir',
          icon: '/icon-512.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/icon-512.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'BE STRONG', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Fermer la notification
    return;
  } else {
    // Action par défaut
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 