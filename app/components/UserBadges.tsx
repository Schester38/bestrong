'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Star, 
  Award, 
  Crown, 
  Zap, 
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
  color: string
}

interface BadgesData {
  earned: Badge[]
  all: Badge[]
  totalEarned: number
  totalAvailable: number
  score: number
  rank: string
}

interface UserBadgesProps {
  userId?: string
  className?: string
}

export default function UserBadges({ userId, className = '' }: UserBadgesProps) {
  const [badges, setBadges] = useState<BadgesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAllBadges, setShowAllBadges] = useState(false)

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      loadBadges()
    }
  }, [userId])

  const loadBadges = async () => {
    if (!userId || userId.trim() === '') return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/badges?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setBadges(data.badges)
      } else {
        setError(data.error || 'Erreur chargement badges')
      }
    } catch (error) {
      console.error('Erreur chargement badges:', error)
      setError('Erreur réseau')
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Diamant': return '💎'
      case 'Platine': return '🥇'
      case 'Or': return '🥇'
      case 'Argent': return '🥈'
      default: return '🥉'
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Diamant': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
      case 'Platine': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
      case 'Or': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Argent': return 'text-gray-500 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
      default: return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Erreur: {error}</p>
        </div>
      </div>
    )
  }

  if (!badges) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun badge disponible</p>
        </div>
      </div>
    )
  }

  const displayedBadges = showAllBadges ? badges.all : badges.earned

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Badges & Récompenses
          </h3>
        </div>
        <button
          onClick={loadBadges}
          className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Statistiques des badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {badges.totalEarned}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Badges obtenus
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {badges.totalAvailable}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total disponible
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {badges.score}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Score total
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {getRankIcon(badges.rank)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Rang {badges.rank}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton pour basculer entre badges obtenus et tous les badges */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowAllBadges(!showAllBadges)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showAllBadges
              ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {showAllBadges ? 'Voir badges obtenus' : 'Voir tous les badges'}
        </button>
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedBadges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-4 rounded-lg border transition-all duration-200 ${
              badge.earned
                ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60'
            }`}
          >
            {/* Icône du badge */}
            <div className="text-center mb-3">
              <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                {badge.icon}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                {badge.name}
              </div>
            </div>

            {/* Description */}
            <div className="text-center">
              <p className={`text-xs ${
                badge.earned 
                  ? 'text-gray-700 dark:text-gray-300' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {badge.description}
              </p>
            </div>

            {/* Indicateur de statut */}
            {badge.earned && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            )}

            {/* Date d'obtention */}
            {badge.earned && badge.earnedAt && (
              <div className="absolute bottom-1 left-1">
                <div className="text-xs text-gray-400">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message si aucun badge obtenu */}
      {!showAllBadges && badges.earned.length === 0 && (
        <div className="text-center py-8">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Aucun badge obtenu pour le moment
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Continuez à être actif pour débloquer vos premiers badges !
          </p>
        </div>
      )}

      {/* Progression vers le prochain rang */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Progression vers le prochain rang
          </h4>
          <span className={`text-sm px-2 py-1 rounded-full font-medium ${getRankColor(badges.rank)}`}>
            {badges.rank}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((badges.score / getNextRankScore(badges.rank)) * 100, 100)}%` 
            }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {badges.score} / {getNextRankScore(badges.rank)} points pour le prochain rang
        </p>
      </div>
    </div>
  )
}

// Fonction pour obtenir le score nécessaire pour le prochain rang
function getNextRankScore(currentRank: string): number {
  switch (currentRank) {
    case 'Bronze': return 100
    case 'Argent': return 200
    case 'Or': return 300
    case 'Platine': return 500
    case 'Diamant': return 1000
    default: return 1000
  }
} 