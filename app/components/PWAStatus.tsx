'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'

export default function PWAStatus() {
  const { isInstallable, isInstalled, isStandalone, isLoading, pwaInfo, refreshPWAStatus } = usePWA()
  const [showDetails, setShowDetails] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ne pas afficher si l'app est déjà installée ou en mode standalone
  if (!isClient || isLoading || isInstalled || isStandalone) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Indicateur de statut - seulement si pas installable */}
      {!isInstallable && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                PWA disponible
              </span>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDetails ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
          </div>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>Mode standalone:</span>
                  <span className={isStandalone ? 'text-green-600' : 'text-gray-500'}>
                    {isStandalone ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Installable:</span>
                  <span className={isInstallable ? 'text-green-600' : 'text-gray-500'}>
                    {isInstallable ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Worker:</span>
                  <span className={pwaInfo?.hasServiceWorker ? 'text-green-600' : 'text-red-600'}>
                    {pwaInfo?.hasServiceWorker ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Notifications:</span>
                  <span className={pwaInfo?.hasNotifications ? 'text-green-600' : 'text-red-600'}>
                    {pwaInfo?.hasNotifications ? 'Disponible' : 'Non disponible'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={refreshPWAStatus}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Actualiser
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 