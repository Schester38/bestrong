'use client'

import { useState, useEffect } from 'react'
import { testSupabaseConnection } from '../utils/supabase'

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [envStatus, setEnvStatus] = useState<any>(null)

  useEffect(() => {
    checkEnvStatus()
  }, [])

  const checkEnvStatus = async () => {
    try {
      const response = await fetch('/api/test-env')
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error('Erreur lors de la vérification des variables d\'environnement:', error)
    }
  }

  const runSupabaseTest = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Diagnostic Supabase
        </h1>

        {/* Statut des variables d'environnement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Variables d'environnement
          </h2>
          {envStatus ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">URL Supabase:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  envStatus.hasUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envStatus.supabaseUrl}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Clé anonyme:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  envStatus.hasKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {envStatus.supabaseKey}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
          )}
        </div>

        {/* Test de connexion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test de connexion Supabase
          </h2>
          
          <button
            onClick={runSupabaseTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 mb-4"
          >
            {loading ? 'Test en cours...' : 'Tester la connexion'}
          </button>

          {testResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? '✅ Connexion réussie' : '❌ Échec de la connexion'}
                </h3>
                {testResult.error && (
                  <pre className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border overflow-auto">
                    {JSON.stringify(testResult.error, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Solutions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
            Solutions aux problèmes courants
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                🔄 Projet Supabase en pause
              </h4>
              <ul className="ml-4 mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• Allez sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                <li>• Connectez-vous à votre compte</li>
                <li>• Trouvez votre projet "bestrong"</li>
                <li>• Cliquez sur "Restore" ou "Resume"</li>
                <li>• Attendez quelques minutes que le projet redémarre</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                🔑 Variables d'environnement manquantes
              </h4>
              <ul className="ml-4 mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                <li>• Créez un fichier <code className="bg-yellow-100 px-1 rounded">.env.local</code> à la racine</li>
                <li>• Ajoutez vos clés Supabase</li>
                <li>• Redémarrez le serveur Next.js</li>
              </ul>
            </div>

                         <div>
               <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                 📊 Tables manquantes
               </h4>
               <ul className="ml-4 mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
                 <li>• Allez sur <a href="/test-tables" className="underline">/test-tables</a></li>
                 <li>• Cliquez sur "Initialiser les tables (Service Role)"</li>
                 <li>• Ou utilisez le script SQL dans <code className="bg-yellow-100 px-1 rounded">supabase_schema.sql</code></li>
                 <li>• Vérifiez que toutes les tables sont créées</li>
               </ul>
             </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Liens utiles
          </h3>
          <div className="space-y-2 text-sm">
            <a href="/setup-env" className="block text-blue-700 dark:text-blue-300 hover:underline">
              🔧 Configuration de l'environnement
            </a>
            <a href="/test-tables" className="block text-blue-700 dark:text-blue-300 hover:underline">
              📊 Test des tables
            </a>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="block text-blue-700 dark:text-blue-300 hover:underline">
              📚 Documentation Supabase
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 