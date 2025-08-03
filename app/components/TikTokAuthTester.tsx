'use client';

import React, { useState } from 'react';
import { 
  Key, 
  Lock, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function TikTokAuthTester() {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Configuration TikTok
  const config = {
    clientKey: 'awa475usd401dv8x',
    clientSecret: 'YAvRoNIraJjdeGaoC2rvGJ1XRwkAoymX',
    scopes: 'video.publish,photo.publish,comment.manage,biz.spark.auth,video.list,business.get',
    redirectUri: 'https://your-domain.com/api/tiktok/callback'
  };

  // Générer l'URL d'authentification
  const generateAuthUrl = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tiktok/auth');
      
      if (response.ok) {
        const data = await response.json();
        setAuthUrl(data.auth_url);
        setSuccess('URL d\'authentification générée avec succès');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la génération de l\'URL');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Copier l'URL d'authentification
  const copyAuthUrl = () => {
    navigator.clipboard.writeText(authUrl);
    setSuccess('URL copiée dans le presse-papiers');
  };

  // Copier le token d'accès
  const copyToken = () => {
    navigator.clipboard.writeText(accessToken);
    setSuccess('Token copié dans le presse-papiers');
  };

  // Tester l'authentification
  const testAuth = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Testeur d'Authentification TikTok
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Testez l'authentification avec vos vraies clés d'API
          </p>
        </div>
        <Key className="w-6 h-6 text-pink-500" />
      </div>

      {/* Messages d'erreur/succès */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Configuration TikTok
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Key
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={config.clientKey}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(config.clientKey)}
                className="text-blue-500 hover:text-blue-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client Secret
            </label>
            <div className="flex items-center space-x-2">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.clientSecret}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-gray-500 hover:text-gray-600"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(config.clientSecret)}
                className="text-blue-500 hover:text-blue-600"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Scopes
          </label>
          <input
            type="text"
            value={config.scopes}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Actions d'Authentification
        </h4>
        
        <div className="space-y-4">
          <button
            onClick={generateAuthUrl}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Générer l'URL d'authentification
              </>
            )}
          </button>

          {authUrl && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={testAuth}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Tester l'authentification
                </button>
                <button
                  onClick={copyAuthUrl}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">URL d'authentification :</div>
                <div className="text-sm text-gray-900 dark:text-white break-all">
                  {authUrl}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Comment utiliser l'authentification ?
            </h5>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>1. Cliquez sur "Générer l'URL d'authentification"</p>
              <p>2. Cliquez sur "Tester l'authentification" pour ouvrir TikTok</p>
              <p>3. Autorisez votre application dans TikTok</p>
              <p>4. Vous recevrez un code d'autorisation</p>
              <p>5. Utilisez ce code pour obtenir un token d'accès</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 