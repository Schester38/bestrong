'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Clock, Award, Users, Activity, BarChart3 } from 'lucide-react'

interface StatCard {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
  icon: any
  color: string
  description?: string
}

interface AdvancedStatsProps {
  userId?: string
  className?: string
}

const AdvancedStats = ({ userId, className = '' }: AdvancedStatsProps) => {
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Tâches Complétées',
      value: 24,
      change: 12,
      changeType: 'increase',
      icon: Target,
      color: 'bg-green-500',
      description: 'Ce mois'
    },
    {
      title: 'Temps Moyen',
      value: '2h 15m',
      change: -8,
      changeType: 'decrease',
      icon: Clock,
      color: 'bg-blue-500',
      description: 'Par tâche'
    },
    {
      title: 'Score Total',
      value: 1247,
      change: 23,
      changeType: 'increase',
      icon: Award,
      color: 'bg-yellow-500',
      description: 'Points gagnés'
    },
    {
      title: 'Série Actuelle',
      value: 5,
      change: 2,
      changeType: 'increase',
      icon: Activity,
      color: 'bg-purple-500',
      description: 'Jours consécutifs'
    }
  ])

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const periods = [
    { key: 'week', label: '7 jours' },
    { key: 'month', label: '30 jours' },
    { key: 'year', label: '1 an' }
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Statistiques Avancées
        </h3>
        <div className="flex space-x-2">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {stat.change && (
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {stat.title}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Graphique simple */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Progression des Tâches
          </h4>
          <BarChart3 className="w-5 h-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          {[
            { label: 'Lundi', value: 80, color: 'bg-green-500' },
            { label: 'Mardi', value: 65, color: 'bg-blue-500' },
            { label: 'Mercredi', value: 90, color: 'bg-purple-500' },
            { label: 'Jeudi', value: 75, color: 'bg-yellow-500' },
            { label: 'Vendredi', value: 85, color: 'bg-pink-500' },
            { label: 'Samedi', value: 60, color: 'bg-indigo-500' },
            { label: 'Dimanche', value: 70, color: 'bg-orange-500' }
          ].map((day, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 w-16">
                {day.label}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className={`${day.color} h-3 rounded-full transition-all duration-1000`}
                  style={{ width: `${day.value}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                {day.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
            💡 Insight Positif
          </h4>
          <p className="text-sm text-green-700 dark:text-green-200">
            Votre productivité a augmenté de 23% ce mois-ci ! Vous êtes sur la bonne voie.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            🎯 Objectif
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Complétez 3 tâches de plus pour débloquer le badge "Productif" !
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdvancedStats 