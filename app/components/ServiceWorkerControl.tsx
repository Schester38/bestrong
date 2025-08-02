'use client';

import { useState, useEffect } from 'react';
import { Settings, Power, PowerOff } from 'lucide-react';

export default function ServiceWorkerControl() {
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier l'état du Service Worker au chargement
    const checkSWStatus = () => {
      const disabled = localStorage.getItem('disableServiceWorker') === 'true';
      setIsEnabled(!disabled);
    };

    checkSWStatus();
  }, []);

  const toggleServiceWorker = async () => {
    setIsLoading(true);
    
    try {
      const action = isEnabled ? 'disable' : 'enable';
      
      const response = await fetch('/api/sw-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        if (action === 'disable') {
          localStorage.setItem('disableServiceWorker', 'true');
          setIsEnabled(false);
        } else {
          localStorage.removeItem('disableServiceWorker');
          setIsEnabled(true);
        }
        
        // Recharger la page pour appliquer les changements
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors du contrôle du Service Worker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnabled === null) {
    return null; // Ne pas afficher pendant le chargement
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleServiceWorker}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-200
          ${isEnabled 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
        title={isEnabled ? 'Désactiver le Service Worker' : 'Activer le Service Worker'}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : isEnabled ? (
          <PowerOff className="w-4 h-4" />
        ) : (
          <Power className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isLoading ? 'Chargement...' : isEnabled ? 'SW ON' : 'SW OFF'}
        </span>
      </button>
    </div>
  );
} 