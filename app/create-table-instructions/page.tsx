'use client'

import { useState } from 'react'

export default function CreateTableInstructionsPage() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Création de la table abonnements
CREATE TABLE IF NOT EXISTS abonnements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_abonnements_user_id ON abonnements(user_id);
CREATE INDEX IF NOT EXISTS idx_abonnements_status ON abonnements(status);

-- Activer RLS (Row Level Security)
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- Politique pour les abonnements
CREATE POLICY "Users can view own subscriptions" ON abonnements
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own subscriptions" ON abonnements
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own subscriptions" ON abonnements
    FOR UPDATE USING (auth.uid()::text = user_id);`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Création de la Table Abonnements
        </h1>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 Instructions pour créer la table manuellement
            </h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold">Allez dans votre tableau de bord Supabase</p>
                  <p>Connectez-vous à <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">supabase.com</a> et accédez à votre projet "bestrong"</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold">Ouvrez le SQL Editor</p>
                  <p>Dans le menu de gauche, cliquez sur "SQL Editor"</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold">Copiez le script SQL</p>
                  <p>Cliquez sur le bouton "Copier le script" ci-dessous</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <div>
                  <p className="font-semibold">Collez et exécutez</p>
                  <p>Collez le script dans l'éditeur SQL et cliquez sur "Run"</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</span>
                <div>
                  <p className="font-semibold">Vérifiez la création</p>
                  <p>Allez dans "Table Editor" pour voir la nouvelle table</p>
                </div>
              </div>
            </div>
          </div>

          {/* Script SQL */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Script SQL
              </h2>
              <button
                onClick={copyToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? '✅ Copié !' : '📋 Copier le script'}
              </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
{sqlScript}
              </pre>
            </div>
          </div>

          {/* Vérification */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ✅ Vérification
            </h2>
            
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>Après avoir exécuté le script, vous pouvez vérifier que la table a été créée :</p>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-semibold mb-2">Requête de vérification :</p>
                <code className="text-sm bg-white dark:bg-gray-600 px-2 py-1 rounded">
                  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'abonnements';
                </code>
              </div>
              
              <p>Cette requête devrait retourner une ligne avec "abonnements" si la table a été créée avec succès.</p>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Liens utiles
            </h3>
            <div className="space-y-2">
              <a href="/debug-supabase" className="block text-blue-700 dark:text-blue-300 hover:underline">
                🔍 Diagnostic Supabase
              </a>
              <a href="/test-tables" className="block text-blue-700 dark:text-blue-300 hover:underline">
                📊 Test des tables
              </a>
              <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="block text-blue-700 dark:text-blue-300 hover:underline">
                📚 Documentation Supabase
              </a>
            </div>
          </div>

          {/* Dépannage */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">
              🔧 Dépannage
            </h3>
            <div className="space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
              <p><strong>Erreur "relation already exists" :</strong> La table existe déjà, c'est normal.</p>
              <p><strong>Erreur de permissions :</strong> Vérifiez que vous avez les droits d'administration sur le projet.</p>
              <p><strong>Erreur de syntaxe :</strong> Copiez exactement le script sans modification.</p>
              <p><strong>Table invisible :</strong> Rafraîchissez la page ou attendez quelques minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 