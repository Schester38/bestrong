'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Clock, Target, Sparkles, Eye, Heart, MessageCircle, Share2, Calendar, X } from 'lucide-react'

interface ContentRecommendation {
  id: string
  title: string
  description: string
  type: 'video' | 'post' | 'story' | 'reel'
  platform: 'tiktok' | 'instagram' | 'youtube'
  category: 'trending' | 'viral' | 'niche' | 'educational'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedViews: number
  estimatedEngagement: number
  timeToCreate: number // en minutes
  trendingScore: number
  tags: string[]
  hashtags: string[]
  bestTimeToPost: string
  inspiration?: string
}

interface ContentRecommendationsProps {
  userId?: string
  className?: string
}

export default function ContentRecommendations({ userId, className = '' }: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'viral' | 'niche' | 'educational'>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'tiktok' | 'instagram' | 'youtube'>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<ContentRecommendation | null>(null)

  useEffect(() => {
    if (userId) {
      loadRecommendations()
    }
  }, [userId, activeFilter, selectedPlatform])

  const loadRecommendations = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        platform: selectedPlatform,
        category: activeFilter,
        limit: '10'
      })
      
      const response = await fetch(`/api/recommendations?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setRecommendations(data.recommendations || [])
      } else {
        console.error('Erreur chargement recommandations:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement recommandations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'viral': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200'
      case 'niche': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'educational': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return '🎵'
      case 'instagram': return '📷'
      case 'youtube': return '▶️'
      default: return '📱'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Eye className="w-4 h-4" />
      case 'post': return <Target className="w-4 h-4" />
      case 'story': return <Clock className="w-4 h-4" />
      case 'reel': return <Sparkles className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const filteredRecommendations = recommendations.filter(rec => {
    const categoryMatch = activeFilter === 'all' || rec.category === activeFilter
    const platformMatch = selectedPlatform === 'all' || rec.platform === selectedPlatform
    return categoryMatch && platformMatch
  })

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            <TrendingUp className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recommandations Contenu
            </h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
          >
            Voir tout
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {(['all', 'trending', 'viral', 'niche', 'educational'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeFilter === filter
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter === 'all' && 'Tout'}
                {filter === 'trending' && 'Tendance'}
                {filter === 'viral' && 'Viral'}
                {filter === 'niche' && 'Niche'}
                {filter === 'educational' && 'Éducatif'}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(['all', 'tiktok', 'instagram', 'youtube'] as const).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {platform === 'all' && 'Toutes'}
                {platform === 'tiktok' && '🎵 TikTok'}
                {platform === 'instagram' && '📷 Instagram'}
                {platform === 'youtube' && '▶️ YouTube'}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des recommandations */}
        <div className="space-y-3">
          {filteredRecommendations.slice(0, 3).map(recommendation => (
            <div
              key={recommendation.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedRecommendation(recommendation)
                setShowModal(true)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getPlatformIcon(recommendation.platform)}</span>
                    {getTypeIcon(recommendation.type)}
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {recommendation.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                      {recommendation.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {recommendation.description}
                  </p>

                  {/* Métriques */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recommendation.estimatedViews.toLocaleString()} vues
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recommendation.estimatedEngagement}% engagement
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {recommendation.timeToCreate} min
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Score {recommendation.trendingScore}
                      </span>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1">
                    {recommendation.hashtags.slice(0, 3).map(hashtag => (
                      <span
                        key={hashtag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {hashtag}
                      </span>
                    ))}
                    {recommendation.hashtags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                        +{recommendation.hashtags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune recommandation disponible</p>
          </div>
        )}
      </div>

      {/* Modal détaillé */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recommandations de Contenu
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filtres dans le modal */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['all', 'trending', 'viral', 'niche', 'educational'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        activeFilter === filter
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {filter === 'all' && 'Toutes les catégories'}
                      {filter === 'trending' && 'Tendances'}
                      {filter === 'viral' && 'Viral'}
                      {filter === 'niche' && 'Niche'}
                      {filter === 'educational' && 'Éducatif'}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(['all', 'tiktok', 'instagram', 'youtube'] as const).map(platform => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        selectedPlatform === platform
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {platform === 'all' && 'Toutes les plateformes'}
                      {platform === 'tiktok' && '🎵 TikTok'}
                      {platform === 'instagram' && '📷 Instagram'}
                      {platform === 'youtube' && '▶️ YouTube'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste complète des recommandations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecommendations.map(recommendation => (
                  <div
                    key={recommendation.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getPlatformIcon(recommendation.platform)}</span>
                        {getTypeIcon(recommendation.type)}
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {recommendation.title}
                        </h4>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(recommendation.category)}`}>
                        {recommendation.category}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {recommendation.description}
                    </p>

                    {/* Métriques détaillées */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {recommendation.estimatedViews.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Vues estimées</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {recommendation.estimatedEngagement}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {recommendation.timeToCreate} min
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Temps création</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {recommendation.trendingScore}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Score tendance</div>
                        </div>
                      </div>
                    </div>

                    {/* Meilleur moment pour poster */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Meilleur moment: {recommendation.bestTimeToPost}
                      </span>
                    </div>

                    {/* Hashtags complets */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hashtags recommandés:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.hashtags.map(hashtag => (
                          <span
                            key={hashtag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-colors">
                        Créer ce contenu
                      </button>
                      <button className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
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