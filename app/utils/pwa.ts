// Utilitaires PWA pour BE STRONG

export async function registerServiceWorker() {
  if (typeof window === 'undefined') return null
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker enregistré avec succès:', registration);

      // Gérer les mises à jour du service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              console.log('Nouvelle version du Service Worker disponible');
              showUpdateNotification();
            }
          });
        }
      });

      // Gérer les erreurs
      registration.addEventListener('error', (error) => {
        console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      });

      return registration;
    } catch (error) {
      console.error('Échec de l\'enregistrement du Service Worker:', error);
      return null;
    }
  }
  return null;
}

export function showUpdateNotification() {
  if (typeof window === 'undefined') return
  
  // Créer une notification pour informer l'utilisateur de la mise à jour
  const updateNotification = document.createElement('div');
  updateNotification.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg';
  updateNotification.innerHTML = `
    <div class="flex items-center space-x-3">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div>
        <p class="font-medium">Nouvelle version disponible</p>
        <p class="text-sm opacity-90">Rechargez la page pour mettre à jour l'application</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(updateNotification);

  // Supprimer automatiquement après 10 secondes
  setTimeout(() => {
    if (updateNotification.parentElement) {
      updateNotification.remove();
    }
  }, 10000);
}

export async function checkForUpdates() {
  if (typeof window === 'undefined') return
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des mises à jour:', error);
    }
  }
}

export function requestNotificationPermission() {
  if (typeof window === 'undefined') return Promise.resolve('denied')
  
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }
    return Promise.resolve(Notification.permission);
  }
  return Promise.resolve('denied');
}

export async function subscribeToPushNotifications() {
  if (typeof window === 'undefined') return null
  
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        
        console.log('Abonnement aux notifications push:', subscription);
        return subscription;
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux notifications:', error);
    }
  }
  return null;
}

export function isPWAInstalled() {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

export function isPWAInstallable() {
  if (typeof window === 'undefined') return false
  
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         !isPWAInstalled();
}

export function getPWAInstallPrompt() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  
  return new Promise<Event | null>((resolve) => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Timeout après 5 secondes
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      resolve(null);
    }, 5000);
  });
}

export function addToHomeScreen() {
  if (typeof window === 'undefined') return
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Demander l'installation
      if (registration.active) {
        registration.active.postMessage({ type: 'INSTALL_PWA' });
      }
    });
  }
}

// Fonction pour initialiser la PWA
export async function initializePWA() {
  if (typeof window === 'undefined') return null
  
  // Enregistrer le service worker
  const registration = await registerServiceWorker();
  
  if (registration) {
    // Vérifier les mises à jour périodiquement
    setInterval(checkForUpdates, 1000 * 60 * 60); // Toutes les heures
    
    // Demander les permissions de notification
    if (isPWAInstallable()) {
      await requestNotificationPermission();
    }
  }
  
  return registration;
}

// Fonction pour obtenir les informations de la PWA
export function getPWAInfo() {
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      isInstallable: false,
      hasServiceWorker: false,
      hasPushManager: false,
      hasNotifications: false,
      userAgent: ''
    }
  }
  
  return {
    isInstalled: isPWAInstalled(),
    isInstallable: isPWAInstallable(),
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    hasNotifications: 'Notification' in window,
    userAgent: navigator.userAgent
  };
} 