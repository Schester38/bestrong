"use client";

import { useState } from 'react';

export default function SetupEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkEnvStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-tasks');
      const data = await response.json();
      setEnvStatus(data);
    } catch (error) {
      setEnvStatus({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Configuration des Variables d'Environnement
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Instructions de Configuration
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  1. Créer le fichier .env.local
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Créez un fichier <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env.local</code> à la racine de votre projet.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  2. Ajouter les variables Supabase
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Autres variables
NODE_ENV=development`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  3. Où trouver ces clés ?
                </h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Allez sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">supabase.com</a></li>
                  <li>• Connectez-vous à votre projet</li>
                  <li>• Allez dans Settings → API</li>
                  <li>• Copiez les clés nécessaires</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  4. Redémarrer le serveur
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Après avoir créé le fichier .env.local, redémarrez votre serveur Next.js.
                </p>
              </div>
            </div>
          </div>

          {/* Test de configuration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test de Configuration
            </h2>
            
            <button
              onClick={checkEnvStatus}
              disabled={loading}
              className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Vérifier la configuration'}
            </button>

            {envStatus && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Statut de la configuration:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {JSON.stringify(envStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Dépannage */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Dépannage
          </h3>
          <div className="text-yellow-800 dark:text-yellow-200 space-y-2 text-sm">
            <div>
              <strong>Erreur "Clé de service manquante" :</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Vérifiez que SUPABASE_SERVICE_ROLE_KEY est définie dans .env.local</li>
                <li>• Utilisez l'option "Initialiser les tables (Anon Key)" sur /test-tables</li>
                <li>• Ou configurez les permissions RLS dans Supabase</li>
              </ul>
            </div>
            <div>
              <strong>Erreur "Clé anonyme manquante" :</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Vérifiez que NEXT_PUBLIC_SUPABASE_ANON_KEY est définie</li>
                <li>• Redémarrez le serveur après modification</li>
              </ul>
            </div>
            <div>
              <strong>Erreur "URL Supabase manquante" :</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Vérifiez que NEXT_PUBLIC_SUPABASE_URL est définie</li>
                <li>• L'URL doit ressembler à : https://xxx.supabase.co</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <a
            href="/test-tables"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Test des Tables
          </a>
          <a
            href="/debug-tasks"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
          >
            Debug Complet
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