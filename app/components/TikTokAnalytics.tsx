'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Zap,
  Target,
  Lightbulb,
  Calendar,
  Hash,
  Play,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Key,
  Building,
  User
} from 'lucide-react';

interface TikTokStats {
  followers: number;
  following: number;
  likes: number;
  views: number;
  videos: number;
  engagement_rate: number;
  avg_views_per_video: number;
  best_posting_time: string;
  top_hashtags: string[];
  account_type: 'personal' | 'business';
  content_performance: {
    video_id: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    hashtags: string[];
    duration: number;
    posted_at: string;
  }[];
}

interface AIRecommendation {
  id: string;
  type: 'hashtag' | 'timing' | 'content' | 'engagement' | 'trending' | 'business' | 'personal';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  action: string;
  estimated_growth: string;
}

export default function TikTokAnalytics() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<TikTokStats | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'recommendations' | 'ai-insights'>('overview');
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  // Connexion TikTok via OAuth selon le type de compte
  const connectTikTok = async () => {
    if (!tiktokUsername.trim()) {
      setError('Veuillez entrer votre nom d\'utilisateur TikTok');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Configuration OAuth selon le type de compte
      const clientId = accountType === 'business' 
        ? process.env.NEXT_PUBLIC_TIKTOK_BUSINESS_CLIENT_ID
        : process.env.NEXT_PUBLIC_TIKTOK_PERSONAL_CLIENT_ID;
      
      const redirectUri = `${window.location.origin}/api/tiktok/callback`;
      
      // Scopes différents selon le type de compte
      const scopes = accountType === 'business' 
        ? 'user.info.basic,video.list,user.info.stats,video.publish,comment.manage'
        : 'user.info.basic,video.list,user.info.stats';
      
      const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientId}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${tiktokUsername}|${accountType}`;
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur de connexion TikTok:', error);
      setError('Erreur lors de la connexion à TikTok');
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkTikTokConnection = async () => {
      try {
        const response = await fetch('/api/tiktok/status');
        const data = await response.json();
        
        if (data.connected) {
          setIsConnected(true);
          setAccessToken(data.accessToken);
          setAccountType(data.accountType || 'personal');
          loadTikTokData();
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de connexion:', error);
      }
    };

    checkTikTokConnection();
  }, []);

  // Charger les données TikTok
  const loadTikTokData = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/data', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Account-Type': accountType
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Erreur lors du chargement des données TikTok:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnecter TikTok
  const disconnectTikTok = async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' });
      setIsConnected(false);
      setStats(null);
      setRecommendations([]);
      setAccessToken('');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: number) => {
    if (priority <= 2) return <Zap className="w-4 h-4 text-red-500" />;
    if (priority <= 3) return <Target className="w-4 h-4 text-yellow-500" />;
    return <Lightbulb className="w-4 h-4 text-blue-500" />;
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analyse TikTok IA
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connectez votre compte TikTok pour recevoir des recommandations personnalisées et optimiser votre croissance
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Sélection du type de compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de compte TikTok
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAccountType('personal')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    accountType === 'personal'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Compte Personnel</div>
                      <div className="text-xs text-gray-500">Créateurs, influenceurs</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setAccountType('business')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    accountType === 'business'
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-pink-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">Compte Business</div>
                      <div className="text-xs text-gray-500">Entreprises, marques</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur TikTok
              </label>
              <input
                type="text"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                placeholder="@votre_username"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={connectTikTok}
              disabled={isLoading || !tiktokUsername.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Connecter {accountType === 'business' ? 'TikTok Business' : 'TikTok'}
                </div>
              )}
            </button>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center mb-2">
                <Key className="w-4 h-4 mr-1" />
                Connexion sécurisée via OAuth TikTok
              </div>
              <p className="text-center">
                {accountType === 'business' 
                  ? 'Accès complet aux données business et fonctionnalités avancées'
                  : 'Accès aux données publiques de votre profil pour l\'analyse'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec stats principales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analyse TikTok IA
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {accountType === 'business' ? (
                <Building className="w-4 h-4 text-blue-500" />
              ) : (
                <User className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {accountType === 'business' ? 'Compte Business' : 'Compte Personnel'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Connecté</span>
            </div>
            <button
              onClick={disconnectTikTok}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Déconnecter
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.followers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Abonnés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vues totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.engagement_rate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.videos}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vidéos</div>
            </div>
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'content', label: 'Contenu', icon: Play },
              { id: 'recommendations', label: 'Recommandations', icon: Lightbulb },
              { id: 'ai-insights', label: 'IA Insights', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des données...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Meilleur moment de publication
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-pink-500" />
                        <span className="text-lg font-medium">{stats.best_posting_time}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Vues moyennes par vidéo
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <span className="text-lg font-medium">
                          {stats.avg_views_per_video.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Hashtags les plus utilisés
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.top_hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fonctionnalités spécifiques au compte Business */}
                  {accountType === 'business' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Building className="w-5 h-5 text-blue-500 mr-2" />
                        Fonctionnalités Business
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Publication automatique</div>
                          <div className="text-gray-600 dark:text-gray-400">Disponible</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Modération commentaires</div>
                          <div className="text-gray-600 dark:text-gray-400">Disponible</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Analytics avancés</div>
                          <div className="text-gray-600 dark:text-gray-400">Disponible</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Campagnes publicitaires</div>
                          <div className="text-gray-600 dark:text-gray-400">Disponible</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'content' && stats && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Performance de vos vidéos récentes
                  </h4>
                  {stats.content_performance.map((video, index) => (
                    <div key={video.video_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              Vidéo #{index + 1}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(video.posted_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {video.views.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">vues</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-gray-500">Likes</div>
                          <div className="font-medium">{video.likes.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Commentaires</div>
                          <div className="font-medium">{video.comments}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Partages</div>
                          <div className="font-medium">{video.shares}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Recommandations IA personnalisées
                    {accountType === 'business' && (
                      <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                        (Optimisées pour Business)
                      </span>
                    )}
                  </h4>
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getPriorityIcon(rec.priority)}
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {rec.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact === 'high' ? 'Impact élevé' : rec.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Action recommandée :
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {rec.action}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Croissance estimée : {rec.estimated_growth}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'ai-insights' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="w-6 h-6 text-purple-500" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Insights IA
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Croissance optimale
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {accountType === 'business' 
                              ? 'Votre compte business a un potentiel de croissance de +200% en 3 mois'
                              : 'Votre compte a un potentiel de croissance de +150% en 3 mois'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Audience cible
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {accountType === 'business'
                              ? 'Concentrez-vous sur les 25-45 ans pour maximiser les conversions'
                              : 'Concentrez-vous sur les 18-24 ans pour maximiser l\'engagement'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Fréquence optimale
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {accountType === 'business'
                              ? 'Publiez 2-3 vidéos par semaine pour maintenir la présence de marque'
                              : 'Publiez 3-4 vidéos par semaine pour maintenir l\'algorithme'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Score de performance
                      </h5>
                      <div className="text-3xl font-bold text-green-600">
                        {accountType === 'business' ? '92/100' : '87/100'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {accountType === 'business' 
                          ? 'Excellent potentiel business'
                          : 'Excellent potentiel de croissance'
                        }
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Prochain objectif
                      </h5>
                      <div className="text-lg font-bold text-blue-600">
                        {accountType === 'business' ? '50K abonnés' : '25K abonnés'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {accountType === 'business' 
                          ? 'Atteignable en 4 mois'
                          : 'Atteignable en 2 mois'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 