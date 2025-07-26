"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  User, 
  Activity, 
  Filter, 
  RefreshCw, 
  Eye,
  Plus,
  LogIn,
  LogOut,
  Coins
} from "lucide-react";
import Link from "next/link";

interface Activity {
  id: string;
  userId: string;
  userPhone: string;
  userPseudo?: string;
  type: 'login' | 'register' | 'logout' | 'task_created' | 'task_completed' | 'credits_earned' | 'credits_spent';
  description: string;
  details?: unknown;
  timestamp: string;
  credits?: number;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    const authenticated = sessionStorage.getItem("admin_authenticated");
    if (authenticated !== "true") {
      window.location.href = "/admin";
    }
  }, []);

  // Charger les activités
  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/activities");
      const data = await response.json();
      
      if (data.error) {
        // setError(data.error); // Original code had this line commented out
      } else {
        setActivities(data.activities || []);
      }
    } catch {
      // setError("Erreur lors du chargement des activités"); // Original code had this line commented out
    } finally {
      setLoading(false);
    }
  };

  // Actualisation automatique
  useEffect(() => {
    loadActivities();
    
    if (autoRefresh) {
      const interval = setInterval(loadActivities, 10000); // Actualiser toutes les 10 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filtrer les activités
  const filteredActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    
    // Filtre par date
    if (startDate && activityDate < new Date(startDate)) return false;
    if (endDate && activityDate > new Date(endDate + "T23:59:59")) return false;
    
    // Filtre par type
    if (selectedType !== "all" && activity.type !== selectedType) return false;
    
    return true;
  });

  // Obtenir l'icône selon le type d'activité
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'register': return <Plus className="w-4 h-4" />;
      case 'logout': return <LogOut className="w-4 h-4" />;
      case 'task_created': return <Activity className="w-4 h-4" />;
      case 'task_completed': return <Eye className="w-4 h-4" />;
      case 'credits_earned': return <Coins className="w-4 h-4" />;
      case 'credits_spent': return <Coins className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Obtenir la couleur selon le type d'activité
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'register': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'logout': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
      case 'task_created': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400';
      case 'task_completed': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'credits_earned': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'credits_spent': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Activités utilisateurs
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadActivities}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg ${
                  autoRefresh 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {autoRefresh ? 'Auto-actualisation ON' : 'Auto-actualisation OFF'}
              </button>
              <Link href="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-3 py-1 rounded-full font-medium transition-colors">
                Retour admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="JJ/MM/AAAA"
                title="Date de début"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="JJ/MM/AAAA"
                title="Date de fin"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d&apos;activité
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                title="Type d'activité"
              >
                <option value="all">Toutes les activités</option>
                <option value="login">Connexions</option>
                <option value="register">Inscriptions</option>
                <option value="logout">Déconnexions</option>
                <option value="task_created">Tâches créées</option>
                <option value="task_completed">Tâches complétées</option>
                <option value="credits_earned">Crédits gagnés</option>
                <option value="credits_spent">Crédits dépensés</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedType("all");
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total activités</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredActivities.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateurs uniques</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(filteredActivities.map(a => a.userId)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <Coins className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Crédits gagnés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredActivities
                    .filter(a => a.type === 'credits_earned')
                    .reduce((sum, a) => sum + (a.credits || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredActivities.filter(a => {
                    const today = new Date();
                    const activityDate = new Date(a.timestamp);
                    return activityDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des activités */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activités récentes
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredActivities.length} activité(s)
            </span>
          </div>

          {/* error && ( // Original code had this line commented out */}
          {/*   <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"> // Original code had this line commented out */}
          {/*     {error} // Original code had this line commented out */}
          {/*   </div> // Original code had this line commented out */}
          {/* ) // Original code had this line commented out */}

          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-pink-500" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Aucune activité trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activity.userPseudo || activity.userPhone}
                          </span>
                          {activity.credits && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({activity.credits} crédits)
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                        {typeof activity.details === 'string' && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 