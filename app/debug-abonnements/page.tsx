'use client'

import { useState, useEffect } from 'react'

export default function DebugAbonnementsPage() {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-supabase-status')
      const data = await response.json()
      setDiagnosticResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const testAbonnementsTable = async () => {
    setLoading(true)
    try {
      // Test direct de la table abonnements
      const response = await fetch('/api/test-abonnements-table')
      const data = await response.json()
      setDiagnosticResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Diagnostic Table Abonnements
        </h1>

        <div className="mb-6 flex gap-4">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Diagnostic en cours...' : 'Diagnostic complet'}
          </button>
          
          <button
            onClick={testAbonnementsTable}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Test en cours...' : 'Test table abonnements'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {diagnosticResults && (
          <div className="space-y-6">
            {/* Résumé spécifique abonnements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                État de la Table Abonnements
              </h2>
              
              {diagnosticResults.results?.tables?.abonnements && (
                <div className={`p-4 rounded-lg border ${
                  diagnosticResults.results.tables.abonnements.exists 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className="font-semibold mb-2">Table Abonnements</h3>
                  <div className="space-y-2 text-sm">
                    <p className={`font-bold ${
                      diagnosticResults.results.tables.abonnements.exists ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.results.tables.abonnements.exists ? '✅ Existe' : '❌ N\'existe pas'}
                    </p>
                    {diagnosticResults.results.tables.abonnements.error && (
                      <p className="text-red-600">Erreur: {diagnosticResults.results.tables.abonnements.error}</p>
                    )}
                    {diagnosticResults.results.tables.abonnements.exists && (
                      <>
                        <p>Données: {diagnosticResults.results.tables.abonnements.count} enregistrements</p>
                        <p className={`font-bold ${
                          diagnosticResults.results.tables.abonnements.hasData ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {diagnosticResults.results.tables.abonnements.hasData ? '✅ Avec données' : '⚠️ Vide'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions de correction */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
                🔧 Solutions si la table n'existe pas
              </h3>
              
              <div className="space-y-4 text-yellow-800 dark:text-yellow-200 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Option 1 : Création via SQL Editor</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Allez dans le SQL Editor de Supabase</li>
                    <li>Copiez le script du fichier <code className="bg-yellow-100 px-1 rounded">fix_abonnements_table.sql</code></li>
                    <li>Exécutez le script</li>
                    <li>Relancez le diagnostic</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Option 2 : Création via API</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Allez sur <a href="/debug-supabase" className="underline">/debug-supabase</a></li>
                    <li>Cliquez sur "Créer table abonnements"</li>
                    <li>Si ça ne marche pas, utilisez l'option 1</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Option 3 : Vérification manuelle</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Dans le SQL Editor, exécutez : <code className="bg-yellow-100 px-1 rounded">SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';</code></li>
                    <li>Vérifiez si 'abonnements' apparaît dans la liste</li>
                    <li>Si oui, le problème vient des permissions RLS</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Résultats complets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Résultats Complets
              </h2>
              
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(diagnosticResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 