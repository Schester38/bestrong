'use client'

import { useState, useEffect } from 'react'
import { Trophy, Target, Star, Zap, Calendar, Award, CheckCircle, Clock, X } from 'lucide-react'

interface Challenge {
  id: string
  title?: string
  description: string
  type: string
  difficulty?: string
  category?: string
  reward_credits?: number
  reward_experience?: number
  target_value?: number
  isCompleted?: boolean
  completedAt?: string
  created_at: string
  user_id?: string
  user_phone?: string
  user_pseudo?: string
  progress?: number
}

interface ChallengeSystemProps {
  userId?: string
  className?: string
}

export default function ChallengeSystem({ userId, className = '' }: ChallengeSystemProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'special'>('daily')
  const [showModal, setShowModal] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      loadChallenges()
    }
  }, [userId, activeTab])

  const loadChallenges = async () => {
    if (!userId || userId.trim() === '') {
      console.log('User ID non disponible, arrêt du chargement des défis')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/challenges/progress?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setChallenges(data.challenges || [])
      } else {
        console.error('Erreur chargement défis:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement défis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async (challengeId: string, progress: number) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/challenges/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          challengeId,
          progress
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Mettre à jour l'état local
        setChallenges(prev => prev.map(challenge => 
          challenge.id === challengeId 
            ? { 
                ...challenge, 
                progress: data.progress || progress,
                isCompleted: data.completed || challenge.isCompleted
              }
            : challenge
        ))

        if (data.completed) {
          // Afficher une notification de récompense
          alert(data.message)
        }
      } else {
        console.error('Erreur mise à jour progression:', data.error)
      }
    } catch (error) {
      console.error('Erreur mise à jour progression:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
      case 'expert': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content': return <Target className="w-4 h-4" />
      case 'engagement': return <Star className="w-4 h-4" />
      case 'social': return <Zap className="w-4 h-4" />
      case 'growth': return <Trophy className="w-4 h-4" />
      default: return <Award className="w-4 h-4" />
    }
  }

  const filteredChallenges = challenges.filter(challenge => {
    // Si c'est un défi créé via l'admin (type 'task_created'), l'afficher dans tous les onglets
    if (challenge.type === 'task_created') {
      return true
    }
    // Sinon, filtrer par type comme avant
    return challenge.type === activeTab
  })

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Défis & Récompenses
            </h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
          >
            Voir tout
          </button>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly', 'special'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-600 text-pink-600 dark:text-pink-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'daily' && 'Quotidien'}
              {tab === 'weekly' && 'Hebdo'}
              {tab === 'monthly' && 'Mensuel'}
              {tab === 'special' && 'Spécial'}
            </button>
          ))}
        </div>

        {/* Liste des défis */}
        <div className="space-y-3">
          {filteredChallenges.slice(0, 3).map(challenge => (
            <div
              key={challenge.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedChallenge(challenge)
                setShowModal(true)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getCategoryIcon(challenge.category || '')}
                                          <h4 className="font-medium text-gray-900 dark:text-white">
                        {challenge.title || challenge.description || 'Défi sans titre'}
                      </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty || '')}`}>
                      {challenge.difficulty || 'Inconnu'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {challenge.description}
                  </p>
                  
                  {/* Progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progression</span>
                      <span>{challenge.progress || 0}/{challenge.target_value || 1}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(((challenge.progress || 0) / (challenge.target_value || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    
                    {/* Boutons de progression */}
                    {!challenge.isCompleted && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => updateProgress(challenge.id, (challenge.progress || 0) + 1)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          +1 Progression
                        </button>
                        <button
                          onClick={() => updateProgress(challenge.id, challenge.target_value || 1)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Compléter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Récompense */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">{challenge.reward_credits || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">{challenge.reward_experience || 0} XP</span>
                      </div>
                      {/* Removed badge as it's not in the new Challenge interface */}
                    </div>
                    
                    {challenge.isCompleted ? (
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Terminé</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">En cours</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun défi disponible pour le moment</p>
          </div>
        )}
      </div>

      {/* Modal détaillé */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Défis & Récompenses
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Onglets dans le modal */}
              <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly', 'special'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab
                        ? 'bg-white dark:bg-gray-600 text-pink-600 dark:text-pink-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'daily' && 'Quotidien'}
                    {tab === 'weekly' && 'Hebdomadaire'}
                    {tab === 'monthly' && 'Mensuel'}
                    {tab === 'special' && 'Spécial'}
                  </button>
                ))}
              </div>

              {/* Liste complète des défis */}
              <div className="space-y-4">
                {filteredChallenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(challenge.category || '')}
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {challenge.title || 'Défi sans titre'}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty || '')}`}>
                            {challenge.difficulty || 'Inconnu'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {challenge.description}
                        </p>
                        
                        {/* Progression */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progression</span>
                            <span>{challenge.progress || 0}/{challenge.target_value || 1}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(((challenge.progress || 0) / (challenge.target_value || 1)) * 100, 100)}%` }}
                            />
                          </div>
                          
                          {/* Boutons de progression */}
                          {!challenge.isCompleted && (
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => updateProgress(challenge.id, (challenge.progress || 0) + 1)}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                              >
                                +1 Progression
                              </button>
                              <button
                                onClick={() => updateProgress(challenge.id, challenge.target_value || 1)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Compléter
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Récompense */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-medium">{challenge.reward_credits || 0} crédits</span>
                            </div>
                            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                              <Zap className="w-4 h-4" />
                              <span className="text-sm font-medium">{challenge.reward_experience || 0} XP</span>
                            </div>
                            {/* Removed badge as it's not in the new Challenge interface */}
                          </div>
                          
                          {challenge.isCompleted ? (
                            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Terminé</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">En cours</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 