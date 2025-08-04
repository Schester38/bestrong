'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Target, Activity, Clock, Award, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTasks: number;
    totalCredits: number;
    newUsersThisMonth: number;
    tasksThisMonth: number;
  };
  trends: {
    userGrowth: number;
    taskGrowth: number;
  };
  topUsers: Array<{
    id: string;
    phone: string;
    pseudo: string | null;
    credits: number;
    createdAt: string;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/analytics');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Réponse non-JSON reçue');
      }
      
      const analyticsData = await response.json();
      
      if (analyticsData.error) {
        throw new Error(analyticsData.error);
      }
      
      setData(analyticsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-red-700 dark:text-red-300 text-sm mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          📊 Analytics Admin
        </h3>
        <button 
          onClick={fetchAnalytics}
          className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm"
        >
          Actualiser
        </button>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Utilisateurs</p>
              <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
            </div>
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold">{data.overview.activeUsers}</p>
            </div>
            <Activity className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tâches Complétées</p>
              <p className="text-2xl font-bold">{data.overview.totalTasks}</p>
            </div>
            <Target className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Crédits Totaux</p>
              <p className="text-2xl font-bold">{data.overview.totalCredits}</p>
            </div>
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Croissance Utilisateurs</h4>
          <div className="flex items-center">
            {data.trends.userGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`font-bold ${data.trends.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.trends.userGrowth}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">ce mois</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Croissance Tâches</h4>
          <div className="flex items-center">
            {data.trends.taskGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`font-bold ${data.trends.taskGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.trends.taskGrowth}%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">ce mois</span>
          </div>
        </div>
      </div>

      {/* Top utilisateurs */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🏆 Top 10 Utilisateurs</h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="space-y-2">
            {data.topUsers.slice(0, 10).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-500 mr-3">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.pseudo || user.phone}
                    </p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600">{user.credits} crédits</p>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité quotidienne */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">📅 Activité Quotidienne (7 jours)</h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="space-y-2">
            {data.dailyActivity.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 w-20">
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((day.count / Math.max(...data.dailyActivity.map(d => d.count))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 