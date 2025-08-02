'use client'

import { useState, useEffect } from 'react'
import { initializePWA, getPWAInfo, isPWAInstalled, isPWAInstallable } from '../utils/pwa'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pwaInfo, setPwaInfo] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const initialize = async () => {
      try {
        // Initialiser la PWA
        await initializePWA()
        
        // Obtenir les informations PWA
        const info = getPWAInfo()
        setPwaInfo(info)
        
        // Vérifier si l'app est en mode standalone (installée)
        const standalone = isPWAInstalled()
        setIsStandalone(standalone)
        setIsInstalled(standalone)
        
        // Vérifier si l'installation est possible
        const installable = isPWAInstallable()
        setIsInstallable(installable)
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation PWA:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()

    // Écouter les changements de mode d'affichage
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => {
      const standalone = isPWAInstalled()
      setIsStandalone(standalone)
      setIsInstalled(standalone)
    }
    
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      // Afficher le prompt d'installation
      await deferredPrompt.prompt()

      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation')
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      } else {
        console.log('Utilisateur a refusé l\'installation')
        return false
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error)
      return false
    }
  }

  const dismissInstallPrompt = () => {
    setIsInstallable(false)
    setDeferredPrompt(null)
  }

  const refreshPWAStatus = () => {
    if (!isClient) return
    
    const info = getPWAInfo()
    setPwaInfo(info)
    setIsInstalled(isPWAInstalled())
    setIsInstallable(isPWAInstallable())
  }

  // Retourner des valeurs par défaut si pas encore côté client
  if (!isClient) {
    return {
      isInstallable: false,
      isInstalled: false,
      isStandalone: false,
      isLoading: true,
      pwaInfo: null,
      installApp: async () => false,
      dismissInstallPrompt: () => {},
      refreshPWAStatus: () => {},
      deferredPrompt: null
    }
  }

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isLoading,
    pwaInfo,
    installApp,
    dismissInstallPrompt,
    refreshPWAStatus,
    deferredPrompt
  }
} 