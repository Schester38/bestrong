'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'

// Fonction pour obtenir les instructions d'installation
const getInstructions = () => {
  if (typeof window === 'undefined') {
    return {
      title: 'Installer l\'application',
      steps: [
        'Recherchez l\'option "Installer" ou "Ajouter à l\'écran d\'accueil"',
        'Suivez les instructions de votre navigateur'
      ]
    }
  }

  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/android/.test(userAgent)) {
    return {
      title: 'Installer sur Android',
      steps: [
        'Appuyez sur le menu (⋮) en haut à droite',
        'Sélectionnez "Ajouter à l\'écran d\'accueil"',
        'Confirmez l\'installation'
      ]
    }
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return {
      title: 'Installer sur iOS',
      steps: [
        'Appuyez sur l\'icône de partage (□↑)',
        'Sélectionnez "Sur l\'écran d\'accueil"',
        'Appuyez sur "Ajouter"'
      ]
    }
  } else if (/chrome/.test(userAgent)) {
    return {
      title: 'Installer sur Chrome',
      steps: [
        'Cliquez sur l\'icône d\'installation (📱) dans la barre d\'adresse',
        'Ou utilisez le menu (⋮) > "Plus d\'outils" > "Créer un raccourci"'
      ]
    }
  } else if (/firefox/.test(userAgent)) {
    return {
      title: 'Installer sur Firefox',
      steps: [
        'Cliquez sur le menu (☰)',
        'Sélectionnez "Installer l\'application"',
        'Confirmez l\'installation'
      ]
    }
  } else {
    return {
      title: 'Installer l\'application',
      steps: [
        'Recherchez l\'option "Installer" ou "Ajouter à l\'écran d\'accueil"',
        'Suivez les instructions de votre navigateur'
      ]
    }
  }
}

export default function PWAInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructions, setInstructions] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const { isInstallable, isInstalled, isStandalone } = usePWA()

  useEffect(() => {
    setIsClient(true)
    setInstructions(getInstructions())
  }, [])

  // Ne pas afficher si l'app est déjà installée ou si l'installation automatique est disponible
  if (isInstalled || isStandalone || isInstallable || !isClient) {
    return null
  }

  if (!instructions) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-7 4 7M3 10h18M7 15h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {instructions.title}
            </h3>
          </div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showInstructions ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>
        
        {showInstructions && (
          <div className="mt-3 space-y-2">
            {instructions.steps.map((step: string, index: number) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowInstructions(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Ne plus afficher
          </button>
        </div>
      </div>
    </div>
  )
} 