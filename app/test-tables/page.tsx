"use client";

import { useState, useEffect } from 'react';

export default function TestTablesPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initResults, setInitResults] = useState<any>(null);
  const [initLoading, setInitLoading] = useState(false);

  const testTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-tables');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const initTables = async () => {
    setInitLoading(true);
    try {
      const response = await fetch('/api/init-tables');
      const data = await response.json();
      setInitResults(data);
    } catch (error) {
      setInitResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setInitLoading(false);
    }
  };

  const initTablesSimple = async () => {
    setInitLoading(true);
    try {
      const response = await fetch('/api/init-tables-simple');
      const data = await response.json();
      setInitResults(data);
    } catch (error) {
      setInitResults({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    testTables();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test des Tables Supabase
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test des tables existantes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test des Tables
            </h2>
            
            <button
              onClick={testTables}
              disabled={loading}
              className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Tester les tables'}
            </button>

            {testResults && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Résultats du test:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Initialisation des tables */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Initialisation des Tables
            </h2>
            
            <div className="space-y-2">
              <button
                onClick={initTables}
                disabled={initLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {initLoading ? 'Initialisation...' : 'Initialiser les tables (Service Role)'}
              </button>
              <button
                onClick={initTablesSimple}
                disabled={initLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {initLoading ? 'Initialisation...' : 'Initialiser les tables (Anon Key)'}
              </button>
            </div>

            {initResults && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Résultats de l'initialisation:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(initResults, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Instructions
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
            <li>• Cliquez sur "Tester les tables" pour vérifier l'état actuel des tables</li>
            <li>• Si des tables sont manquantes, cliquez sur "Initialiser les tables"</li>
            <li>• Les tables nécessaires sont : users, tasks, task_completions, app_stats</li>
            <li>• Après initialisation, rechargez la page du Dashboard</li>
          </ul>
        </div>

        {/* Retour au Dashboard */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Retour au Dashboard
          </a>
        </div>
      </div>
    </div>
  );
} 