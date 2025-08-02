'use client'

import { useState, useEffect } from 'react'
import { Brain, Settings, Activity, Users, MessageCircle, Bell, TrendingUp, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface AlgorithmStats {
  totalNotifications: number
  totalMessages: number
  activeUsers: number
  engagementRate: number
  averageResponseTime: number
  userSatisfaction: number
}

interface AlgorithmConfig {
  notificationsEnabled: boolean
  messagesEnabled: boolean
  autoResponseEnabled: boolean
  gamificationEnabled: boolean
  personalizationLevel: 'low' | 'medium' | 'high'
  responseSpeed: 'slow' | 'normal' | 'fast'
}

export default function AdminIntelligence() {
  const [stats, setStats] = useState<AlgorithmStats>({
    totalNotifications: 0,
    totalMessages: 0,
    activeUsers: 0,
    engagementRate: 0,
    averageResponseTime: 0,
    userSatisfaction: 0
  })
  
  const [config, setConfig] = useState<AlgorithmConfig>({
    notificationsEnabled: true,
    messagesEnabled: true,
    autoResponseEnabled: true,
    gamificationEnabled: true,
    personalizationLevel: 'medium',
    responseSpeed: 'normal'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'analytics' | 'logs'>('overview')

  useEffect(() => {
    loadStats()
    loadConfig()
  }, [])

  const loadStats = async () => {
    try {
      // Simuler le chargement des statistiques
      setStats({
        totalNotifications: 1247,
        totalMessages: 892,
        activeUsers: 156,
        engagementRate: 78.5,
        averageResponseTime: 1.2,
        userSatisfaction: 4.6
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  const loadConfig = async () => {
    try {
      // Charger la configuration depuis localStorage
      const savedConfig = localStorage.getItem('algorithm-config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Erreur chargement config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfig = async (newConfig: AlgorithmConfig) => {
    try {
      setConfig(newConfig)
      localStorage.setItem('algorithm-config', JSON.stringify(newConfig))
      // Ici on pourrait aussi sauvegarder en base de données
    } catch (error) {
      console.error('Erreur sauvegarde config:', error)
    }
  }

  const toggleFeature = (feature: keyof AlgorithmConfig) => {
    const newConfig = { ...config, [feature]: !config[feature] }
    saveConfig(newConfig)
  }

  const updatePersonalization = (level: 'low' | 'medium' | 'high') => {
    const newConfig = { ...config, personalizationLevel: level }
    saveConfig(newConfig)
  }

  const updateResponseSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    const newConfig = { ...config, responseSpeed: speed }
    saveConfig(newConfig)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/admin"
              className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour à l'admin</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <Brain className="w-8 h-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Intelligence Artificielle
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Contrôlez et optimisez l'algorithme intelligent de votre plateforme
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'logs', label: 'Logs', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pink-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Contenu */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Notifications générées
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalNotifications.toLocaleString()}
                    </p>
                  </div>
                  <Bell className="w-8 h-8 text-pink-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Messages automatiques
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalMessages.toLocaleString()}
                    </p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Utilisateurs actifs
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.activeUsers}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Taux d'engagement
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.engagementRate}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Temps de réponse moyen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageResponseTime}s
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Satisfaction utilisateur
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.userSatisfaction}/5
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* État du système */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                État du système
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifications intelligentes
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    config.notificationsEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {config.notificationsEnabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Réponses automatiques
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    config.autoResponseEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {config.autoResponseEnabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gamification
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    config.gamificationEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {config.gamificationEnabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Niveau de personnalisation
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {config.personalizationLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configuration de l'algorithme
              </h3>
              
              <div className="space-y-6">
                {/* Fonctionnalités */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Fonctionnalités
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: 'notificationsEnabled', label: 'Notifications intelligentes', description: 'Générer des notifications personnalisées' },
                      { key: 'messagesEnabled', label: 'Messages automatiques', description: 'Activer les réponses automatiques' },
                      { key: 'autoResponseEnabled', label: 'Réponses intelligentes', description: 'IA conversationnelle pour le support' },
                      { key: 'gamificationEnabled', label: 'Gamification', description: 'Badges et récompenses automatiques' }
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{feature.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFeature(feature.key as keyof AlgorithmConfig)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config[feature.key as keyof AlgorithmConfig]
                              ? 'bg-pink-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config[feature.key as keyof AlgorithmConfig] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paramètres avancés */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                    Paramètres avancés
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Niveau de personnalisation
                      </label>
                      <select
                        value={config.personalizationLevel}
                        onChange={(e) => updatePersonalization(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">Faible (Notifications basiques)</option>
                        <option value="medium">Moyen (Personnalisation standard)</option>
                        <option value="high">Élevé (IA avancée)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vitesse de réponse
                      </label>
                      <select
                        value={config.responseSpeed}
                        onChange={(e) => updateResponseSpeed(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="slow">Lente (Réponses réfléchies)</option>
                        <option value="normal">Normale (Équilibrée)</option>
                        <option value="fast">Rapide (Réponses instantanées)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Analytics de l'IA
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Les analytics détaillés seront disponibles prochainement.
            </p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Logs de l'algorithme
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Les logs détaillés seront disponibles prochainement.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 