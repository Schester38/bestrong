'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, Clock, Target, Award, Users, MessageCircle, X, Check, Volume2, VolumeX } from 'lucide-react'

interface Notification {
  id: string
  type: 'task' | 'achievement' | 'reminder' | 'social' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: Date
  actionUrl?: string
}

interface SmartNotificationsProps {
  userId?: string
  className?: string
}

const SmartNotifications = ({ userId, className = '' }: SmartNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false) // Changé à false par défaut
  const [hasError, setHasError] = useState(false)

  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    taskNotifications: true,
    achievementNotifications: true,
    reminderNotifications: true,
    socialNotifications: true,
    systemNotifications: false
  })

  const [isOpen, setIsOpen] = useState(false)

  // Charger les notifications depuis l'API
  useEffect(() => {
    if (userId) {
      loadNotifications()
    }
  }, [userId])

  const loadNotifications = async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      setHasError(false)
      
      // Récupérer les notifications de l'admin
      const adminResponse = await fetch(`/api/admin/notifications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=60',
        },
      })
      
      // Récupérer les notifications système
      const systemResponse = await fetch(`/api/notifications?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=60',
        },
      })
      
      let allNotifications: Notification[] = []
      
      // Traiter les notifications de l'admin
      if (adminResponse.ok) {
        const adminData = await adminResponse.json()
        if (Array.isArray(adminData)) {
          const adminNotifications = adminData.map((n: any) => ({
            id: `admin-${n.id}`,
            type: 'system' as const,
            title: 'Message de l\'équipe',
            message: n.message,
            priority: 'medium' as const,
            read: n.lu,
            createdAt: new Date(n.date),
            actionUrl: undefined
          }))
          allNotifications.push(...adminNotifications)
        }
      }
      
      // Traiter les notifications système
      if (systemResponse.ok) {
        const systemData = await systemResponse.json()
        if (systemData.notifications) {
          const systemNotifications = systemData.notifications.map((n: any) => ({
            id: `system-${n.id}`,
          type: n.type,
          title: n.title,
          message: n.message,
          priority: n.priority,
          read: n.read,
          createdAt: new Date(n.created_at),
          actionUrl: n.action_url
        }))
          allNotifications.push(...systemNotifications)
        }
      }
      
      // Trier par date de création (plus récent en premier)
      allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      setNotifications(allNotifications)
      
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
      setHasError(true)
      // En cas d'erreur, on affiche des notifications de démonstration
      setNotifications([
        {
          id: 'demo-1',
          type: 'achievement' as const,
          title: 'Bienvenue !',
          message: 'Vous avez rejoint BE STRONG avec succès',
          priority: 'medium' as const,
          read: false,
          createdAt: new Date(),
          actionUrl: '/dashboard'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      // Déterminer le type de notification basé sur l'ID
      const isAdminNotification = id.startsWith('admin-')
      const actualId = id.replace(/^(admin-|system-)/, '')
      
      if (isAdminNotification) {
        // Marquer comme lu pour les notifications admin
        const response = await fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notifId: actualId, userId })
        })
        
        if (response.ok) {
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read: true } : n)
          )
        }
      } else {
        // Marquer comme lu pour les notifications système
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: actualId, read: true })
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        }
      }
    } catch (error) {
      console.error('Erreur marquer comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      
      for (const notification of unreadNotifications) {
        const isAdminNotification = notification.id.startsWith('admin-')
        const actualId = notification.id.replace(/^(admin-|system-)/, '')
        
        if (isAdminNotification) {
          await fetch('/api/admin/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notifId: actualId, userId })
          })
        } else {
          await fetch('/api/notifications', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: actualId, read: true })
          })
        }
      }
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Erreur marquer tout comme lu:', error)
    }
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return Target
      case 'achievement': return Award
      case 'reminder': return Clock
      case 'social': return Users
      case 'system': return Settings
      default: return Bell
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `il y a ${minutes} min`
    if (hours < 24) return `il y a ${hours}h`
    return `il y a ${days}j`
  }

  return (
    <div className={`relative z-10 ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal des notifications */}
      {isOpen && (
        <div className="notifications-popup fixed inset-0 flex items-center justify-center p-4">
          {/* Overlay sombre */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup centré */}
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                </button>
            </div>
          </div>

          {/* Paramètres */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Paramètres
              </h4>
              <div className="space-y-2">
                {Object.entries(settings).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Chargement...
                </div>
              ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getTypeIcon(notification.type)
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        notification.type === 'task' ? 'text-blue-500' :
                        notification.type === 'achievement' ? 'text-yellow-500' :
                        notification.type === 'reminder' ? 'text-green-500' :
                        notification.type === 'social' ? 'text-purple-500' :
                        'text-gray-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-medium text-sm ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-green-500"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.actionUrl && (
                            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                              Voir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartNotifications 