'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Target, Zap, Plus, Edit, Trash2, Play, Pause, CheckCircle, X } from 'lucide-react'

interface ScheduledContent {
  id: string
  title: string
  description: string
  type: 'video' | 'post' | 'story' | 'reel'
  platform: 'tiktok' | 'instagram' | 'youtube'
  scheduledDate: string
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  hashtags: string[]
  thumbnail?: string
  notes?: string
  autoPost: boolean
}

interface ContentSchedulerProps {
  userId?: string
  className?: string
}

export default function ContentScheduler({ userId, className = '' }: ContentSchedulerProps) {
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState<ScheduledContent | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'failed'>('all')

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      loadScheduledContent()
    }
  }, [userId, selectedDate, filterStatus])

  const loadScheduledContent = async () => {
    if (!userId || userId.trim() === '') {
      console.log('User ID non disponible, arrêt du chargement du contenu planifié')
      return
    }

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        userId: userId,
        date: selectedDate,
        status: filterStatus
      })
      
      const response = await fetch(`/api/scheduler?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setScheduledContent(data.scheduledContent || [])
      } else {
        console.error('Erreur chargement contenu planifié:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement contenu planifié:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createContent = () => {
    const newContent: ScheduledContent = {
      id: Date.now().toString(),
      title: 'Nouveau contenu',
      description: 'Description du contenu',
      type: 'video',
      platform: 'tiktok',
      scheduledDate: selectedDate,
      scheduledTime: '12:00',
      status: 'draft',
      hashtags: [],
      autoPost: false
    }
    setEditingContent(newContent)
    setShowModal(true)
  }

  const saveContent = async (content: ScheduledContent) => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: content.id,
          userId,
          title: content.title,
          description: content.description,
          type: content.type,
          platform: content.platform,
          scheduledDate: content.scheduledDate,
          scheduledTime: content.scheduledTime,
          status: content.status,
          hashtags: content.hashtags,
          thumbnailUrl: content.thumbnail,
          notes: content.notes,
          autoPost: content.autoPost
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Recharger le contenu
        loadScheduledContent()
        setShowModal(false)
        setEditingContent(null)
      } else {
        console.error('Erreur sauvegarde contenu:', data.error)
      }
    } catch (error) {
      console.error('Erreur sauvegarde contenu:', error)
    }
  }

  const deleteContent = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduler?id=${id}&userId=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        // Recharger le contenu
        loadScheduledContent()
      } else {
        console.error('Erreur suppression contenu:', data.error)
      }
    } catch (error) {
      console.error('Erreur suppression contenu:', error)
    }
  }

  const toggleStatus = (id: string, newStatus: ScheduledContent['status']) => {
    setScheduledContent(prev => 
      prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'published': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
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
      case 'video': return <Target className="w-4 h-4" />
      case 'post': return <Zap className="w-4 h-4" />
      case 'story': return <Clock className="w-4 h-4" />
      case 'reel': return <Play className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const filteredContent = scheduledContent.filter(content => {
    const statusMatch = filterStatus === 'all' || content.status === filterStatus
    const dateMatch = content.scheduledDate === selectedDate
    return statusMatch && dateMatch
  })

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            <Calendar className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Planificateur de Contenu
            </h3>
          </div>
          <button
            onClick={createContent}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            Planifier
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">Tous</option>
                <option value="draft">Brouillon</option>
                <option value="scheduled">Planifié</option>
                <option value="published">Publié</option>
                <option value="failed">Échoué</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste du contenu planifié */}
        <div className="space-y-3">
          {filteredContent.map(content => (
            <div
              key={content.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getPlatformIcon(content.platform)}</span>
                    {getTypeIcon(content.type)}
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                      {content.status === 'draft' && 'Brouillon'}
                      {content.status === 'scheduled' && 'Planifié'}
                      {content.status === 'published' && 'Publié'}
                      {content.status === 'failed' && 'Échoué'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {content.description}
                  </p>

                  {/* Détails de planification */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(content.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{content.scheduledTime}</span>
                      </div>
                      {content.autoPost && (
                        <div className="flex items-center space-x-1 text-green-500">
                          <Zap className="w-4 h-4" />
                          <span>Auto-poste</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingContent(content)
                          setShowModal(true)
                        }}
                        className="p-1 text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteContent(content.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Hashtags */}
                  {content.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {content.hashtags.map(hashtag => (
                        <span
                          key={hashtag}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun contenu planifié pour cette date</p>
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      {showModal && editingContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingContent.id ? 'Modifier le contenu' : 'Planifier du contenu'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingContent(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                saveContent(editingContent)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plateforme
                      </label>
                      <select
                        value={editingContent.platform}
                        onChange={(e) => setEditingContent({...editingContent, platform: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="tiktok">🎵 TikTok</option>
                        <option value="instagram">📷 Instagram</option>
                        <option value="youtube">▶️ YouTube</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={editingContent.type}
                        onChange={(e) => setEditingContent({...editingContent, type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="video">Vidéo</option>
                        <option value="post">Post</option>
                        <option value="story">Story</option>
                        <option value="reel">Reel</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editingContent.scheduledDate}
                        onChange={(e) => setEditingContent({...editingContent, scheduledDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Heure
                      </label>
                      <input
                        type="time"
                        value={editingContent.scheduledTime}
                        onChange={(e) => setEditingContent({...editingContent, scheduledTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hashtags (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={editingContent.hashtags.join(', ')}
                      onChange={(e) => setEditingContent({
                        ...editingContent, 
                        hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                      placeholder="#hashtag1, #hashtag2, #hashtag3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoPost"
                      checked={editingContent.autoPost}
                      onChange={(e) => setEditingContent({...editingContent, autoPost: e.target.checked})}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="autoPost" className="text-sm text-gray-700 dark:text-gray-300">
                      Publication automatique
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingContent(null)
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-colors"
                  >
                    {editingContent.id ? 'Modifier' : 'Planifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 