'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const user = localStorage.getItem("currentUser")
    const access = localStorage.getItem("dashboardAccessGranted")
    
    if (user && access) {
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } else {
      // Rediriger vers l'accueil si pas connecté
      router.push("/")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirection en cours...</p>
      </div>
    </div>
  )
} 