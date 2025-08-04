'use client';

import { useState } from 'react';

export default function TikTokSimpleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');

  const generateAuthUrl = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tiktok/auth');
      const data = await response.json();
      
      if (data.success) {
        setAuthUrl(data.auth_url);
      } else {
        setError(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const openAuthUrl = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔗 Liaison TikTok Simple
        </h3>
        <button
          onClick={generateAuthUrl}
          disabled={isLoading}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
        >
          {isLoading ? '⏳ Génération...' : '🔗 Générer URL'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-lg p-4">
          ❌ {error}
        </div>
      )}

      {authUrl && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg p-4">
            ✅ URL d'authentification générée
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={openAuthUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🌐 Ouvrir TikTok
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(authUrl)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              📋 Copier URL
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">URL d'authentification :</div>
            <div className="text-sm text-gray-900 dark:text-white break-all">
              {authUrl}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
          📋 Instructions :
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Cliquez sur "Générer URL"</li>
          <li>Cliquez sur "Ouvrir TikTok"</li>
          <li>Connectez-vous à votre compte TikTok</li>
          <li>Autorisez l'application BeStrong</li>
          <li>Vous serez redirigé vers votre dashboard</li>
        </ol>
      </div>
    </div>
  );
} 