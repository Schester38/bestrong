'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Star, Target, Zap, Heart, Crown, Medal, Award } from 'lucide-react'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'achievement' | 'milestone' | 'special'
  unlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedAt?: Date
}

interface BadgeSystemProps {
  userId?: string
  className?: string
}

const BadgeSystem = ({ userId, className = '' }: BadgeSystemProps) => {
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUnlocked, setShowUnlocked] = useState<Badge | null>(null)

  useEffect(() => {
    if (userId) {
      fetchBadges()
    }
  }, [userId])

  const fetchBadges = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${userId}/badges`)
      const data = await response.json()

      if (response.ok) {
        // Convertir les dates string en objets Date
        const badgesWithDates = data.badges.map((badge: any) => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined
        }))
        setBadges(badgesWithDates)
      } else {
        console.error('Erreur récupération badges:', data.error)
        // Fallback vers les badges par défaut
        setDefaultBadges()
      }
    } catch (error) {
      console.error('Erreur fetch badges:', error)
      // Fallback vers les badges par défaut
      setDefaultBadges()
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultBadges = () => {
    setBadges([
      {
        id: 'first-task',
        name: 'Première Tâche',
        description: 'Complétez votre première tâche',
        icon: 'target',
        color: 'bg-blue-500',
        category: 'achievement',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'task-master',
        name: 'Maître des Tâches',
        description: 'Complétez 50 tâches',
        icon: 'trophy',
        color: 'bg-yellow-500',
        category: 'milestone',
        unlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'streak-7',
        name: 'Série de 7 Jours',
        description: 'Connectez-vous 7 jours de suite',
        icon: 'star',
        color: 'bg-purple-500',
        category: 'milestone',
        unlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Rejoignez BE STRONG dans les premiers',
        icon: 'crown',
        color: 'bg-gradient-to-r from-pink-500 to-purple-600',
        category: 'special',
        unlocked: true,
        unlockedAt: new Date()
      },
      {
        id: 'social-butterfly',
        name: 'Papillon Social',
        description: 'Partagez 10 fois du contenu',
        icon: 'heart',
        color: 'bg-pink-500',
        category: 'achievement',
        unlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'speed-demon',
        name: 'Démon de Vitesse',
        description: 'Complétez 5 tâches en 1 heure',
        icon: 'zap',
        color: 'bg-orange-500',
        category: 'achievement',
        unlocked: false,
        progress: 0,
        maxProgress: 5
      }
    ])
  }

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      trophy: Trophy,
      star: Star,
      target: Target,
      zap: Zap,
      heart: Heart,
      crown: Crown,
      medal: Medal,
      award: Award
    }
    return icons[iconName] || Trophy
  }

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount = badges.length

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Badges & Récompenses
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Chargement...
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Chargement des badges...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Badges & Récompenses
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedCount}/{totalCount} débloqués
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const Icon = getIcon(badge.icon)
          const progressPercentage = badge.progress && badge.maxProgress 
            ? (badge.progress / badge.maxProgress) * 100 
            : 0

          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                badge.unlocked
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`${badge.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${
                    badge.unlocked 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {badge.description}
                  </p>
                  
                  {badge.progress !== undefined && badge.maxProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{badge.progress}/{badge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            badge.unlocked ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {badge.unlocked && badge.unlockedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Débloqué le {badge.unlockedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {badge.unlocked && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal pour badge débloqué */}
      {showUnlocked && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center">
            <div className={`${showUnlocked.color} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
              {React.createElement(getIcon(showUnlocked.icon), { className: "w-8 h-8 text-white" })}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Badge Débloqué !
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {showUnlocked.name}
            </p>
            <button
              onClick={() => setShowUnlocked(null)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Super !
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgeSystem 