'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Star, 
  Zap, 
  Award, 
  Activity,
  Flame,
  Users,
  BarChart3,
  Crown
} from 'lucide-react'

interface UserStats {
  user: {
    id: string
    phone: string
    pseudo: string | null
    credits: number
    experience: number
    dateInscription: string
    derniereActivite: string
  }
  activite: {
    totalActivites: number
    activitesCetteSemaine: number
    activitesCeMois: number
    derniereActivite: string | null
  }
  defis: {
    totalCompletes: number
    defisCetteSemaine: number
    defisCeMois: number
    tauxCompletion: number
  }
  progression: {
    niveau: number
    experienceActuelle: number
    experienceProchainNiveau: number
    pourcentageNiveau: number
  }
  recompenses: {
    totalCreditsGagnes: number
    totalExperienceGagnee: number
    creditsCetteSemaine: number
    experienceCetteSemaine: number
  }
  performance: {
    streakActuel: number
    meilleurStreak: number
    joursActifs: number
    moyenneActivitesParJour: number
  }
}

interface UserStatsProps {
  userId?: string
  className?: string
}

export default function UserStats({ userId, className = '' }: UserStatsProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      loadStats()
    }
  }, [userId])

  const loadStats = async () => {
    if (!userId || userId.trim() === '') return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/stats?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Erreur chargement statistiques')
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
      setError('Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (niveau: number) => {
    if (niveau >= 10) return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
    if (niveau >= 5) return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
    if (niveau >= 3) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
    if (streak >= 3) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Erreur: {error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune statistique disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mes Statistiques
          </h3>
        </div>
        <button
          onClick={loadStats}
          className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Niveau et Progression */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Niveau {stats.progression.niveau}</h4>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progression</span>
              <span>{stats.progression.pourcentageNiveau}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progression.pourcentageNiveau}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stats.progression.experienceActuelle} / 1000 XP
          </p>
        </div>

        {/* Streak Actuel */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
          <div className="flex items-center space-x-2 mb-3">
            <Flame className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Streak Actuel</h4>
          </div>
          <div className="text-2xl font-bold text-red-600 mb-1">
            {stats.performance.streakActuel} jours
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Meilleur: {stats.performance.meilleurStreak} jours
          </p>
        </div>

        {/* Défis Complétés */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Défis Complétés</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.defis.totalCompletes}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Taux: {stats.defis.tauxCompletion}%
          </p>
        </div>

        {/* Activités */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Activités</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.activite.totalActivites}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cette semaine: {stats.activite.activitesCetteSemaine}
          </p>
        </div>

        {/* Récompenses */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Récompenses</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Crédits:</span>
              <span className="font-semibold text-yellow-600">{stats.recompenses.totalCreditsGagnes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">XP:</span>
              <span className="font-semibold text-yellow-600">{stats.recompenses.totalExperienceGagnee}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Performance</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Jours actifs:</span>
              <span className="font-semibold text-indigo-600">{stats.performance.joursActifs}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Moyenne/jour:</span>
              <span className="font-semibold text-indigo-600">{stats.performance.moyenneActivitesParJour}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Activité Récente</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cette semaine:</span>
              <span className="font-semibold">{stats.activite.activitesCetteSemaine} activités</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Ce mois:</span>
              <span className="font-semibold">{stats.activite.activitesCeMois} activités</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Défis cette semaine:</span>
              <span className="font-semibold">{stats.defis.defisCetteSemaine}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Récompenses Récentes</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Crédits cette semaine:</span>
              <span className="font-semibold text-yellow-600">{stats.recompenses.creditsCetteSemaine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">XP cette semaine:</span>
              <span className="font-semibold text-yellow-600">{stats.recompenses.experienceCetteSemaine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Prochain niveau:</span>
              <span className="font-semibold">{stats.progression.experienceProchainNiveau} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 