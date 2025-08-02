'use client'

import { useState, useEffect } from 'react'

export default function DebugSupabasePage() {
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

  useEffect(() => {
    runDiagnostic()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Diagnostic Avancé Supabase
        </h1>

        <div className="mb-6 flex gap-4">
          <button
            onClick={runDiagnostic}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Diagnostic en cours...' : 'Relancer le diagnostic'}
          </button>
          
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/create-missing-table', { method: 'POST' });
                const result = await response.json();
                if (result.success) {
                  alert('✅ Table abonnements créée avec succès !');
                  runDiagnostic(); // Relancer le diagnostic
                } else {
                  alert('❌ Erreur: ' + result.message);
                  if (confirm('Voulez-vous voir les instructions pour créer la table manuellement ?')) {
                    window.open('/create-table-instructions', '_blank');
                  }
                }
              } catch (error) {
                alert('❌ Erreur lors de la création de la table');
                if (confirm('Voulez-vous voir les instructions pour créer la table manuellement ?')) {
                  window.open('/create-table-instructions', '_blank');
                }
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg"
          >
            Créer table abonnements
          </button>
          
          <a
            href="/create-table-instructions"
            target="_blank"
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg text-center"
          >
            📋 Instructions manuelles
          </a>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {diagnosticResults && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Résumé du Diagnostic
              </h2>
              
              {diagnosticResults.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${
                    diagnosticResults.summary.siteFunctional 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <h3 className="font-semibold text-sm">Site Fonctionnel</h3>
                    <p className={`text-lg font-bold ${
                      diagnosticResults.summary.siteFunctional ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.summary.siteFunctional ? '✅ Oui' : '❌ Non'}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    diagnosticResults.summary.hasRealData 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <h3 className="font-semibold text-sm">Données Réelles</h3>
                    <p className={`text-lg font-bold ${
                      diagnosticResults.summary.hasRealData ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {diagnosticResults.summary.hasRealData ? '✅ Oui' : '⚠️ Non'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm">Tables Fonctionnelles</h3>
                    <p className="text-lg font-bold text-blue-600">
                      {diagnosticResults.summary.workingTables}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm">Tables avec Données</h3>
                    <p className="text-lg font-bold text-purple-600">
                      {diagnosticResults.summary.tablesWithData}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Variables d'environnement */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Variables d'Environnement
              </h2>
              
              {diagnosticResults.results?.environment && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">URL Supabase:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      diagnosticResults.results.environment.url === 'Définie' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {diagnosticResults.results.environment.url}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Clé Anonyme:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      diagnosticResults.results.environment.anonKey === 'Définie' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {diagnosticResults.results.environment.anonKey}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Clé de Service:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      diagnosticResults.results.environment.serviceKey === 'Définie' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {diagnosticResults.results.environment.serviceKey}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Connexions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Tests de Connexion
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticResults.results?.connection?.anon && (
                  <div className={`p-4 rounded-lg border ${
                    diagnosticResults.results.connection.anon.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold mb-2">Clé Anonyme</h3>
                    <p className={`font-bold ${
                      diagnosticResults.results.connection.anon.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.results.connection.anon.success ? '✅ Connexion réussie' : '❌ Échec'}
                    </p>
                    {diagnosticResults.results.connection.anon.error && (
                      <p className="text-sm text-gray-600 mt-1">
                        Erreur: {diagnosticResults.results.connection.anon.error}
                      </p>
                    )}
                  </div>
                )}
                
                {diagnosticResults.results?.connection?.service && (
                  <div className={`p-4 rounded-lg border ${
                    diagnosticResults.results.connection.service.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold mb-2">Clé de Service</h3>
                    <p className={`font-bold ${
                      diagnosticResults.results.connection.service.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.results.connection.service.success ? '✅ Connexion réussie' : '❌ Échec'}
                    </p>
                    {diagnosticResults.results.connection.service.error && (
                      <p className="text-sm text-gray-600 mt-1">
                        Erreur: {diagnosticResults.results.connection.service.error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tables */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                État des Tables
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {diagnosticResults.results?.tables && Object.entries(diagnosticResults.results.tables).map(([tableName, tableData]: [string, any]) => (
                  <div key={tableName} className={`p-4 rounded-lg border ${
                    tableData.exists 
                      ? tableData.hasData 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold mb-2 capitalize">{tableName}</h3>
                    <div className="space-y-1 text-sm">
                      <p className={`font-bold ${
                        tableData.exists ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tableData.exists ? '✅ Existe' : '❌ N\'existe pas'}
                      </p>
                      {tableData.exists && (
                        <>
                          <p>Données: {tableData.count} enregistrements</p>
                          <p className={`font-bold ${
                            tableData.hasData ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {tableData.hasData ? '✅ Avec données' : '⚠️ Vide'}
                          </p>
                        </>
                      )}
                      {tableData.error && (
                        <p className="text-red-600 text-xs">Erreur: {tableData.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Données spécifiques */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Données Spécifiques
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticResults.results?.data?.userCount && (
                  <div className={`p-4 rounded-lg border ${
                    diagnosticResults.results.data.userCount.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold mb-2">Compteur d'Utilisateurs</h3>
                    <p className={`font-bold ${
                      diagnosticResults.results.data.userCount.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.results.data.userCount.success 
                        ? `${diagnosticResults.results.data.userCount.count} utilisateurs`
                        : 'Erreur'
                      }
                    </p>
                    {diagnosticResults.results.data.userCount.error && (
                      <p className="text-sm text-red-600 mt-1">
                        {diagnosticResults.results.data.userCount.error}
                      </p>
                    )}
                  </div>
                )}
                
                {diagnosticResults.results?.data?.stats && (
                  <div className={`p-4 rounded-lg border ${
                    diagnosticResults.results.data.stats.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <h3 className="font-semibold mb-2">Statistiques</h3>
                    <p className={`font-bold ${
                      diagnosticResults.results.data.stats.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnosticResults.results.data.stats.success ? '✅ Disponibles' : '❌ Erreur'}
                    </p>
                    {diagnosticResults.results.data.stats.data && (
                      <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                        {JSON.stringify(diagnosticResults.results.data.stats.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Résultats complets */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Résultats Complets (JSON)
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