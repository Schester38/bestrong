'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isStandalone, installApp, dismissInstallPrompt } = usePWA()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ne pas afficher si l'app est déjà installée, en mode standalone, ou si l'installation automatique n'est pas disponible
  if (!isClient || isInstalled || isStandalone || !isInstallable) {
    return null
  }

  const handleInstallClick = async () => {
    await installApp()
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-7 4 7M3 10h18M7 15h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Installer BE STRONG
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Accédez rapidement à l'app depuis votre écran d'accueil
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Installer
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 