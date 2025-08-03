'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Calendar, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Image,
  Clock,
  Shield,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Post {
  item_id: string;
  title: string;
  description: string;
  create_time: string;
  video_url?: string;
  image_url?: string;
  is_ad_promotable: boolean;
  authorization_code?: string;
  expires_at?: string;
}

interface TikTokSparkAdsManagerProps {
  businessId: string;
}

export default function TikTokSparkAdsManager({ businessId }: TikTokSparkAdsManagerProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [authorizationDays, setAuthorizationDays] = useState(30);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  // Vérifier les permissions du token
  const checkTokenPermissions = async () => {
    try {
      const response = await fetch('/api/tiktok/tt_user/token_info/get', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokenInfo(data);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
    }
  };

  // Charger les publications
  const loadPosts = async () => {
    setLoading(true);
    try {
      // Vérifier si businessId est configuré
      if (!businessId || businessId === 'your_business_id') {
        setError('Business ID non configuré. Veuillez configurer votre Business ID TikTok.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/tiktok/video/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.videos || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du chargement des publications');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Activer l'autorisation Spark Ads
  const enableSparkAds = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/post/authorize/setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          item_id: itemId,
          is_ad_promotable: true,
          authorization_days: authorizationDays
        })
      });

      if (response.ok) {
        setSuccess('Autorisation Spark Ads activée avec succès');
        loadPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'activation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Désactiver l'autorisation Spark Ads
  const disableSparkAds = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/post/authorize/setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          item_id: itemId,
          is_ad_promotable: false
        })
      });

      if (response.ok) {
        setSuccess('Autorisation Spark Ads désactivée');
        loadPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la désactivation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Étendre l'autorisation
  const extendAuthorization = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/post/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          item_id: itemId,
          authorization_days: authorizationDays
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Autorisation étendue de ${authorizationDays} jours`);
        setSelectedPost(data);
        loadPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'extension');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer l'autorisation
  const deleteAuthorization = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette autorisation Spark Ads ?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/post/authorize/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiktok_access_token') || ''}`,
          'X-Business-ID': businessId
        },
        body: JSON.stringify({
          item_id: itemId
        })
      });

      if (response.ok) {
        setSuccess('Autorisation Spark Ads supprimée');
        loadPosts();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Copier le code d'autorisation
  const copyAuthorizationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Code d\'autorisation copié dans le presse-papiers');
  };

  useEffect(() => {
    checkTokenPermissions();
    loadPosts();
  }, [businessId]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestion Spark Ads
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez les autorisations publicitaires de vos publications TikTok
          </p>
        </div>
        <button
          onClick={loadPosts}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Vérification des permissions */}
      {tokenInfo && (
        <div className={`rounded-lg p-4 ${
          tokenInfo.permissions.spark_auth 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-center space-x-3">
            {tokenInfo.permissions.spark_auth ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Permissions Spark Ads
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tokenInfo.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages d'erreur/succès */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Configuration des autorisations
        </h4>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée d'autorisation (jours)
            </label>
            <input
              type="number"
              value={authorizationDays}
              onChange={(e) => setAuthorizationDays(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-24"
            />
          </div>
          <div className="text-sm text-gray-500">
            Entre 1 et 365 jours
          </div>
        </div>
      </div>

      {/* Liste des publications */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Publications TikTok
        </h4>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune publication trouvée.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.item_id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start space-x-4">
                {/* Miniature */}
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {post.video_url ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <Image className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Informations */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {post.title || `Publication ${post.item_id}`}
                    </h5>
                    <div className="flex items-center space-x-2">
                      {post.is_ad_promotable ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Spark Ads activé
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Non autorisé
                        </span>
                      )}
                    </div>
                  </div>

                  {post.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {post.description}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    Publié le {formatDate(post.create_time)}
                  </div>

                  {/* Code d'autorisation */}
                  {post.authorization_code && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Code d'autorisation
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {post.authorization_code}
                          </div>
                        </div>
                        <button
                          onClick={() => copyAuthorizationCode(post.authorization_code!)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {post.expires_at && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs ${
                            isExpired(post.expires_at) ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            Expire le {formatDate(post.expires_at)}
                            {isExpired(post.expires_at) && ' (Expiré)'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {!post.is_ad_promotable ? (
                      <button
                        onClick={() => enableSparkAds(post.item_id)}
                        disabled={loading || !tokenInfo?.permissions.spark_auth}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded text-sm hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Activer Spark Ads
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => extendAuthorization(post.item_id)}
                          disabled={loading || !tokenInfo?.permissions.spark_auth}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Étendre
                        </button>
                        <button
                          onClick={() => disableSparkAds(post.item_id)}
                          disabled={loading || !tokenInfo?.permissions.spark_auth}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Désactiver
                        </button>
                        <button
                          onClick={() => deleteAuthorization(post.item_id)}
                          disabled={loading || !tokenInfo?.permissions.spark_auth}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Comment utiliser les codes d'autorisation ?
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>1. Activez Spark Ads sur vos publications</p>
              <p>2. Copiez le code d'autorisation généré</p>
              <p>3. Utilisez ce code dans TikTok Ads Manager pour créer des Spark Ads</p>
              <p>4. Gérez la durée de validité selon vos besoins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Business ID */}
      {(businessId === 'your_business_id' || !businessId) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Configuration requise
              </h5>
              <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <p>Pour utiliser les fonctionnalités Spark Ads, vous devez :</p>
                <p>1. Configurer votre Business ID TikTok dans le code</p>
                <p>2. Avoir un token d'accès avec les permissions biz.spark.auth</p>
                <p>3. Être connecté à un compte TikTok Business</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 