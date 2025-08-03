'use client';

import { useState } from 'react';

export default function TikTokAuthTester() {
  const [authUrl, setAuthUrl] = useState('');
  const [redirectUri, setRedirectUri] = useState('https://mybestrong.netlify.app/api/tiktok/callback');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const generateAuthUrl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirect_uri: redirectUri
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthUrl(data.auth_url);
        setTestResult('✅ URL générée avec succès');
      } else {
        const error = await response.text();
        setTestResult(`❌ Erreur: ${error}`);
      }
    } catch (error) {
      setTestResult(`❌ Erreur: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAuthUrl = () => {
    if (authUrl) {
      navigator.clipboard.writeText(authUrl);
      setTestResult('📋 URL copiée dans le presse-papiers');
    }
  };

  const testAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tiktok/tt_user/token_info/get');
      const data = await response.json();
      
      if (data.success) {
        setTestResult('✅ Authentification réussie - Token valide');
      } else {
        setTestResult(`❌ Erreur d'authentification: ${data.error || 'Token invalide'}`);
      }
    } catch (error) {
      setTestResult(`❌ Erreur de test: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔐 Testeur d'Authentification TikTok
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={generateAuthUrl}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Génération...' : '🔗 Générer URL'}
          </button>
          <button
            onClick={testAuth}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '⏳ Test...' : '🧪 Tester Auth'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL de redirection (à configurer selon votre domaine)
          </label>
          <input
            type="text"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder="https://votre-domaine.com/api/tiktok/callback"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Remplacez par votre vrai domaine Netlify
          </p>
        </div>

        {authUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL d'authentification générée :
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={authUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={copyAuthUrl}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                📋 Copier
              </button>
            </div>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {testResult}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
          📋 Instructions de configuration :
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Remplacez l'URL de redirection par votre vrai domaine Netlify</li>
          <li>Configurez cette URL dans votre console TikTok Developer</li>
          <li>Générez l'URL d'authentification</li>
          <li>Testez l'authentification</li>
          <li>Vérifiez les permissions accordées</li>
        </ol>
      </div>
    </div>
  );
} 