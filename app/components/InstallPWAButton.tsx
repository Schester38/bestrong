'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'

interface InstallPWAButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export default function InstallPWAButton({
  variant = 'primary',
  size = 'md',
  className = '',
  showIcon = true,
  children
}: InstallPWAButtonProps) {
  const { isInstallable, isInstalled, isStandalone, installApp } = usePWA()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Ne pas afficher si l'app est déjà installée ou si l'installation n'est pas disponible
  if (!isClient || isInstalled || isStandalone || !isInstallable) {
    return null
  }

  const handleInstall = async () => {
    await installApp()
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }
    
    const variantClasses = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20'
    }
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`
  }

  return (
    <button
      onClick={handleInstall}
      className={getButtonClasses()}
      title="Installer l'application BE STRONG"
    >
      {showIcon && (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21l4-7 4 7M3 10h18M7 15h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {children || 'Installer l\'app'}
    </button>
  )
} 