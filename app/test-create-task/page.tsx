"use client";

import { useState } from 'react';

export default function TestCreateTaskPage() {
  const [formData, setFormData] = useState({
    type: 'LIKE',
    url: 'https://www.tiktok.com/@test/video/123',
    actionsRestantes: 5,
    createur: '+237699486146'
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔄 Test création de tâche...');
      const response = await fetch('/api/exchange/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('✅ Résultat:', data);
      setResult(data);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test de Création de Tâche
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type d'action</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="https://www.tiktok.com/@user/video/123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Actions restantes</label>
              <input
                type="number"
                value={formData.actionsRestantes}
                onChange={(e) => setFormData({...formData, actionsRestantes: Number(e.target.value)})}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Créateur</label>
              <input
                type="text"
                value={formData.createur}
                onChange={(e) => setFormData({...formData, createur: e.target.value})}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                placeholder="+237699486146"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? '🔄 Création...' : 'Créer la tâche de test'}
            </button>
          </form>
        </div>

        {result && (
          <div className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Résultat:
            </h3>
            <pre className="bg-white dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/debug-tasks"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
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