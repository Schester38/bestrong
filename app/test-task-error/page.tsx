"use client";

import { useState } from 'react';

export default function TestTaskErrorPage() {
  const [testData, setTestData] = useState({
    type: 'LIKE',
    url: 'https://www.tiktok.com/@test/video/123',
    actionsRestantes: 5,
    createur: '+237699486146'
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateTask = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    
    try {
      addLog('🔄 Début du test de création de tâche...');
      addLog(`📝 Données à envoyer: ${JSON.stringify(testData, null, 2)}`);
      
      const response = await fetch('/api/exchange/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      addLog(`📡 Réponse reçue - Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      addLog(`📄 Contenu de la réponse: ${responseText}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
        addLog('✅ Réponse parsée en JSON');
      } catch (parseError) {
        addLog(`❌ Erreur parsing JSON: ${parseError}`);
        setResult({ error: 'Réponse non-JSON', rawResponse: responseText });
        return;
      }
      
      setResult(data);
      
      if (response.ok) {
        addLog('🎉 Création de tâche réussie !');
      } else {
        addLog(`❌ Erreur HTTP: ${response.status}`);
      }
      
    } catch (error) {
      addLog(`❌ Erreur réseau: ${error instanceof Error ? error.message : String(error)}`);
      setResult({ error: 'Erreur réseau', details: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testWithDifferentData = async (scenario: string) => {
    let testCase;
    
    switch (scenario) {
      case 'admin':
        testCase = { ...testData, createur: '+237699486146' };
        break;
      case 'newUser':
        testCase = { ...testData, createur: '+237123456789' };
        break;
      case 'invalidUrl':
        testCase = { ...testData, url: 'https://example.com/video' };
        break;
      case 'invalidType':
        testCase = { ...testData, type: 'INVALID' };
        break;
      default:
        testCase = testData;
    }
    
    setTestData(testCase);
    addLog(`🧪 Test avec scénario: ${scenario}`);
    await testCreateTask();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Diagnostic Erreur Création de Tâche
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test de Création
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type d'action</label>
                <select
                  value={testData.type}
                  onChange={(e) => setTestData({...testData, type: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                >
                  <option value="LIKE">Like</option>
                  <option value="FOLLOW">Follow</option>
                  <option value="COMMENT">Commentaire</option>
                  <option value="SHARE">Partage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL TikTok</label>
                <input
                  type="url"
                  value={testData.url}
                  onChange={(e) => setTestData({...testData, url: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Actions restantes</label>
                <input
                  type="number"
                  value={testData.actionsRestantes}
                  onChange={(e) => setTestData({...testData, actionsRestantes: Number(e.target.value)})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Créateur</label>
                <input
                  type="text"
                  value={testData.createur}
                  onChange={(e) => setTestData({...testData, createur: e.target.value})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                />
              </div>

              <button
                onClick={testCreateTask}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? '🔄 Test en cours...' : 'Tester la création'}
              </button>
            </div>

            {/* Scénarios de test */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Scénarios de test
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testWithDifferentData('admin')}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  Test Admin
                </button>
                <button
                  onClick={() => testWithDifferentData('newUser')}
                  disabled={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  Test Nouvel Utilisateur
                </button>
                <button
                  onClick={() => testWithDifferentData('invalidUrl')}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  Test URL Invalide
                </button>
                <button
                  onClick={() => testWithDifferentData('invalidType')}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  Test Type Invalide
                </button>
              </div>
            </div>
          </div>

          {/* Logs et résultats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Logs et Résultats
            </h2>
            
            {/* Logs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Logs d'exécution
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">Aucun log pour le moment...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Résultat */}
            {result && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Résultat
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-64">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <a
            href="/debug-tasks"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Debug Complet
          </a>
          <a
            href="/test-create-task"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Test Simple
          </a>
          <a
            href="/dashboard"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
} 