'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Trophy, Target, Star, Zap } from 'lucide-react'

interface Challenge {
  id?: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  category: 'content' | 'engagement' | 'social' | 'growth'
  reward_credits: number
  reward_experience: number
  target_value: number
  is_active: boolean
  created_at?: string
}

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false)
  const [formData, setFormData] = useState<Challenge>({
    title: '',
    description: '',
    type: 'daily',
    difficulty: 'easy',
    category: 'content',
    reward_credits: 50,
    reward_experience: 100,
    target_value: 1,
    is_active: true
  })

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/challenges')
      const data = await response.json()
      
      if (response.ok) {
        setChallenges(data.challenges || [])
      } else {
        console.error('Erreur chargement défis:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement défis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingChallenge ? '/api/admin/challenges' : '/api/admin/challenges'
      const method = editingChallenge ? 'PUT' : 'POST'
      
      const requestBody = editingChallenge 
        ? { ...formData, id: editingChallenge.id }
        : formData
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (response.ok) {
        setShowForm(false)
        setEditingChallenge(null)
        resetForm()
        loadChallenges()
        alert(editingChallenge ? 'Défi mis à jour avec succès !' : 'Défi créé avec succès !')
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur sauvegarde défi:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setFormData(challenge)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) return
    
    try {
      const response = await fetch(`/api/admin/challenges?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadChallenges()
        alert('Défi supprimé avec succès !')
      } else {
        const data = await response.json()
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur suppression défi:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleCreateDefaults = async () => {
    if (!confirm('Créer automatiquement 12 défis prédéfinis ? Cela ajoutera des défis quotidiens, hebdomadaires, mensuels et spéciaux.')) return
    
    try {
      setIsCreatingDefaults(true)
      const response = await fetch('/api/admin/create-default-challenges', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (response.ok) {
        loadChallenges()
        alert(data.message)
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur création défis par défaut:', error)
      alert('Erreur lors de la création automatique')
    } finally {
      setIsCreatingDefaults(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      difficulty: 'easy',
      category: 'content',
      reward_credits: 50,
      reward_experience: 100,
      target_value: 1,
      is_active: true
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Target className="w-4 h-4" />
      case 'weekly': return <Star className="w-4 h-4" />
      case 'monthly': return <Trophy className="w-4 h-4" />
      case 'special': return <Trophy className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🏆 Gestion des Défis
            </h1>
            <p className="text-gray-600 text-lg">Créez et gérez les défis pour motiver vos utilisateurs</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateDefaults}
              disabled={isCreatingDefaults}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-400 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
            >
              <Zap className="w-5 h-5" />
              <span>{isCreatingDefaults ? 'Création...' : 'Créer Auto'}</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau Défi</span>
            </button>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingChallenge ? '✏️ Modifier le Défi' : '✨ Nouveau Défi'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingChallenge ? 'Modifiez les détails du défi' : 'Créez un nouveau défi pour vos utilisateurs'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingChallenge(null)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎯 Titre du Défi
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Ex: Créateur du jour"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📅 Type de Défi
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="daily">🔄 Quotidien</option>
                      <option value="weekly">📅 Hebdomadaire</option>
                      <option value="monthly">📆 Mensuel</option>
                      <option value="special">⭐ Spécial</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎚️ Niveau de Difficulté
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="easy">🟢 Facile</option>
                      <option value="medium">🟡 Moyen</option>
                      <option value="hard">🟠 Difficile</option>
                      <option value="expert">🔴 Expert</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📂 Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 bg-white"
                    >
                      <option value="content">📝 Contenu</option>
                      <option value="engagement">💬 Engagement</option>
                      <option value="social">👥 Social</option>
                      <option value="growth">📈 Croissance</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      💰 Récompense Crédits
                    </label>
                    <input
                      type="number"
                      value={formData.reward_credits}
                      onChange={(e) => setFormData({...formData, reward_credits: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900"
                      min="0"
                      placeholder="50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      ⭐ Récompense Expérience
                    </label>
                    <input
                      type="number"
                      value={formData.reward_experience}
                      onChange={(e) => setFormData({...formData, reward_experience: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900"
                      min="0"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      🎯 Objectif à Atteindre
                    </label>
                    <input
                      type="number"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900"
                      min="1"
                      placeholder="3"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-800">
                      ✅ Défi Actif
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    📝 Description du Défi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-900 resize-none"
                    rows={4}
                    placeholder="Décrivez le défi en détail..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingChallenge(null)
                      resetForm()
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    ❌ Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    <span>{editingChallenge ? 'Mettre à jour' : 'Créer le Défi'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des défis */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-semibold">Chargement des défis...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(challenge.type)}
                    <h3 className="font-bold text-gray-900 text-lg">{challenge.title || challenge.description}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(challenge)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => challenge.id && handleDelete(challenge.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {challenge.title ? challenge.description : 'Défi créé via l\'interface admin'}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <span className="text-sm font-semibold capitalize text-purple-600">{challenge.type}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Difficulté:</span>
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getDifficultyColor(challenge.difficulty || 'medium')}`}>
                      {challenge.difficulty || 'Moyen'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Récompense:</span>
                    <span className="text-sm font-bold text-green-600">
                      {challenge.reward_credits || 0} 💰 + {challenge.reward_experience || 0} ⭐
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Objectif:</span>
                    <span className="text-sm font-semibold text-blue-600">{challenge.target_value || 1}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Statut:</span>
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${challenge.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {challenge.is_active !== false ? '✅ Actif' : '❌ Inactif'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Créé le:</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {challenge.created_at ? new Date(challenge.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && challenges.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-600 mb-4">Aucun défi créé</h3>
            <p className="text-gray-500 mb-8">Commencez par créer votre premier défi pour motiver vos utilisateurs !</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-lg"
            >
              ✨ Créer le premier défi
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 