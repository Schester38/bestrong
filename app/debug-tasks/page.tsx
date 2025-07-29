"use client";

import { useState } from 'react';

export default function DebugTasksPage() {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-tasks');
      const data = await response.json();
      setDebugResult(data);
    } catch (error) {
      setDebugResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const runTest = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/debug-tasks', { method: 'POST' });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug des Tâches
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Debug des tables */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Diagnostic des Tables
            </h2>
            
            <button
              onClick={runDebug}
              disabled={loading}
              className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
            </button>

            {debugResult && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Résultats du diagnostic:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Test de création */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test de Création de Tâche
            </h2>
            
            <button
              onClick={runTest}
              disabled={testLoading}
              className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {testLoading ? 'Test en cours...' : 'Tester la création'}
            </button>

            {testResult && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Résultats du test:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Instructions de Diagnostic
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <li>• Cliquez sur "Lancer le diagnostic" pour vérifier l'état des tables</li>
            <li>• Cliquez sur "Tester la création" pour essayer de créer une tâche de test</li>
            <li>• Si les tables sont manquantes, utilisez la page /test-tables</li>
            <li>• Vérifiez les logs du serveur pour plus de détails</li>
          </ul>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/test-tables"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Initialiser les Tables
          </a>
          <a
            href="/dashboard"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Retour au Dashboard
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