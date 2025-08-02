'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [loadingText, setLoadingText] = useState('Initialisation...')

  useEffect(() => {
    // Textes de chargement dynamiques
    const loadingTexts = [
      'Initialisation...',
      'Chargement des données...',
      'Connexion au serveur...',
      'Préparation de l\'interface...',
      'Presque prêt...'
    ]

    let currentIndex = 0
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length
      setLoadingText(loadingTexts[currentIndex])
    }, 600)

    // Masquer le splash screen après 3 secondes
    const hideTimeout = setTimeout(() => {
      setIsVisible(false)
    }, 3000)

    return () => {
      clearInterval(textInterval)
      clearTimeout(hideTimeout)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-5 h-5 bg-white/10 rounded-full top-1/4 left-1/4 animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute w-3 h-3 bg-white/10 rounded-full top-2/3 right-1/4 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-4 h-4 bg-white/10 rounded-full bottom-1/3 left-1/3 animate-bounce" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Contenu principal */}
      <div className="text-center text-white relative z-10">
        {/* Logo */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl animate-pulse">
          <img 
            src="/icon-512.png" 
            alt="BE STRONG Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
        </div>

        {/* Nom de l'app */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-shadow">
          BE STRONG
        </h1>
        <p className="text-lg sm:text-xl opacity-90 mb-8">
          Plateforme TikTok
        </p>

        {/* Barre de chargement */}
        <div className="w-48 sm:w-64 h-1 bg-white/20 rounded-full mx-auto mb-4 overflow-hidden">
          <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>

        {/* Texte de chargement */}
        <p className="text-sm sm:text-base opacity-80">
          {loadingText}
        </p>
      </div>

      <style jsx>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce {
          animation: bounce 6s infinite;
        }
      `}</style>
    </div>
  )
} 