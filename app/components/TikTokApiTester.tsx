'use client';

import { useState } from 'react';

interface ApiTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE';
  description: string;
  requiresAuth: boolean;
  requiresBusinessId: boolean;
  testData?: any;
}

const API_TESTS: ApiTest[] = [
  {
    name: '🔐 Authentification',
    endpoint: '/api/tiktok/auth',
    method: 'GET',
    description: 'Générer l\'URL d\'authentification',
    requiresAuth: false,
    requiresBusinessId: false
  },
  {
    name: '📊 Informations Token',
    endpoint: '/api/tiktok/tt_user/token_info/get',
    method: 'GET',
    description: 'Vérifier les permissions du token',
    requiresAuth: true,
    requiresBusinessId: false
  },
  {
    name: '📹 Liste des Vidéos',
    endpoint: '/api/tiktok/video/list',
    method: 'GET',
    description: 'Récupérer la liste des vidéos',
    requiresAuth: true,
    requiresBusinessId: true
  },
  {
    name: '🏢 Données Business',
    endpoint: '/api/tiktok/business/get',
    method: 'GET',
    description: 'Récupérer les données business',
    requiresAuth: true,
    requiresBusinessId: true
  },
  {
    name: '💬 Liste des Commentaires',
    endpoint: '/api/tiktok/business/comment/list?item_id=test',
    method: 'GET',
    description: 'Récupérer les commentaires d\'une vidéo',
    requiresAuth: true,
    requiresBusinessId: true
  },
  {
    name: '🚀 Spark Ads - Autoriser',
    endpoint: '/api/tiktok/post/authorize/setting',
    method: 'POST',
    description: 'Autoriser Spark Ads pour une vidéo',
    requiresAuth: true,
    requiresBusinessId: true,
    testData: {
      item_id: 'test_item_id',
      is_ad_promotable: true,
      authorization_days: 30
    }
  }
];

export default function TikTokApiTester() {
  const [accessToken, setAccessToken] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const runTest = async (test: ApiTest) => {
    setIsLoading(prev => ({ ...prev, [test.name]: true }));
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (test.requiresAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      if (test.requiresBusinessId && businessId) {
        headers['X-Business-ID'] = businessId;
      }

      const options: RequestInit = {
        method: test.method,
        headers
      };

      if (test.method === 'POST' && test.testData) {
        options.body = JSON.stringify(test.testData);
      }

      const response = await fetch(test.endpoint, options);
      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [test.name]: {
          success: response.ok,
          status: response.status,
          data: data,
          error: !response.ok ? data.error || 'Erreur inconnue' : null
        }
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.name]: {
          success: false,
          error: `Erreur réseau: ${error}`,
          data: null
        }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [test.name]: false }));
    }
  };

  const runAllTests = async () => {
    for (const test of API_TESTS) {
      await runTest(test);
      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (testName: string) => {
    const result = testResults[testName];
    if (!result) return '⏳';
    if (result.success) return '✅';
    return '❌';
  };

  const getStatusColor = (testName: string) => {
    const result = testResults[testName];
    if (!result) return 'text-gray-500';
    if (result.success) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🧪 Testeur d'APIs TikTok
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={Object.values(isLoading).some(Boolean)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            🚀 Tester Toutes les APIs
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token d'Accès (optionnel)
          </label>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Bearer token..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business ID (optionnel)
          </label>
          <input
            type="text"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            placeholder="Votre Business ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Tests */}
      <div className="space-y-4">
        {API_TESTS.map((test) => (
          <div key={test.name} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={getStatusColor(test.name)}>{getStatusIcon(test.name)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{test.description}</p>
                </div>
              </div>
              <button
                onClick={() => runTest(test)}
                disabled={isLoading[test.name]}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading[test.name] ? '⏳' : '🧪'}
              </button>
            </div>

            {testResults[test.name] && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                testResults[test.name].success
                  ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                  : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              }`}>
                <div className="font-medium mb-1">
                  {testResults[test.name].success ? '✅ Succès' : '❌ Échec'}
                </div>
                {testResults[test.name].error && (
                  <div className="text-xs opacity-75">{testResults[test.name].error}</div>
                )}
                {testResults[test.name].data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Voir les détails</summary>
                    <pre className="mt-1 text-xs overflow-auto">
                      {JSON.stringify(testResults[test.name].data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
          📋 Instructions de test :
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Commencez par tester l'authentification (pas besoin de token)</li>
          <li>Obtenez un token via l'authentification TikTok</li>
          <li>Ajoutez le token et votre Business ID</li>
          <li>Testez les autres APIs une par une</li>
          <li>Vérifiez les permissions accordées</li>
        </ol>
      </div>
    </div>
  );
} 