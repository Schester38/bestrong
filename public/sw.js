// Service Worker simplifié pour BE STRONG PWA
const CACHE_NAME = 'be-strong-v1';

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours...');
  
  // Activer immédiatement sans attendre
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('Service Worker: Installation terminée');
      return self.skipWaiting();
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation en cours...');
  
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Interception des requêtes réseau (simplifié)
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET et les requêtes API
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  
  // Pour l'instant, laisser passer toutes les requêtes
  // Le cache sera implémenté plus tard si nécessaire
  return;
});

// Gestion des messages
self.addEventListener('message', (event) => {
  try {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (error) {
    console.error('Service Worker: Erreur lors du traitement du message:', error);
  }
}); 