'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Play, Pause, ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  order: number
  videoUrl?: string
  videoTitle?: string
}

interface Tutorial {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
  isActive: boolean
  targetAudience: 'all' | 'new' | 'premium'
  createdAt: Date
  updatedAt: Date
}

export default function AdminTutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const defaultTutorials: Tutorial[] = [
    {
      id: 'welcome-tutorial',
      name: 'Tutoriel de bienvenue',
      description: 'Guide d\'introduction pour les nouveaux utilisateurs',
      steps: [
        {
          id: 'welcome',
          title: 'Bienvenue sur BE STRONG !',
          description: 'Decouvrez comment utiliser notre plateforme pour maximiser votre presence TikTok.',
          position: 'bottom',
          order: 1,
          videoUrl: 'https://www.youtube.com/watch?v=example1',
          videoTitle: 'Introduction à BE STRONG'
        },
        {
          id: 'features',
          title: 'Fonctionnalites principales',
          description: 'Explorez nos outils de creation de contenu, d\'analyse et de gamification.',
          target: '.features-section',
          position: 'top',
          order: 2,
          videoUrl: 'https://www.youtube.com/watch?v=example2',
          videoTitle: 'Guide des fonctionnalités'
        },
        {
          id: 'dashboard',
          title: 'Tableau de bord',
          description: 'Accedez a vos statistiques, badges et taches depuis le tableau de bord.',
          target: 'a[href="/dashboard"]',
          position: 'bottom',
          order: 3,
          videoUrl: 'https://www.youtube.com/watch?v=example3',
          videoTitle: 'Utilisation du tableau de bord'
        }
      ],
      isActive: true,
      targetAudience: 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  useEffect(() => {
    const savedTutorials = localStorage.getItem('admin-tutorials')
    if (savedTutorials) {
      const parsedTutorials = JSON.parse(savedTutorials)
      // Convertir les dates string en objets Date
      const tutorialsWithDates = parsedTutorials.map((tutorial: any) => ({
        ...tutorial,
        createdAt: new Date(tutorial.createdAt),
        updatedAt: new Date(tutorial.updatedAt)
      }))
      setTutorials(tutorialsWithDates)
    } else {
      setTutorials(defaultTutorials)
      localStorage.setItem('admin-tutorials', JSON.stringify(defaultTutorials))
    }
    setIsLoading(false)
  }, [])

  const saveTutorials = (newTutorials: Tutorial[]) => {
    setTutorials(newTutorials)
    localStorage.setItem('admin-tutorials', JSON.stringify(newTutorials))
  }

  const createTutorial = () => {
    const newTutorial: Tutorial = {
      id: `tutorial-${Date.now()}`,
      name: 'Nouveau tutoriel',
      description: 'Description du tutoriel',
      steps: [],
      isActive: true,
      targetAudience: 'all',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setEditingTutorial(newTutorial)
    setIsCreating(true)
  }

  const editTutorial = (tutorial: Tutorial) => {
    setEditingTutorial({ ...tutorial })
    setIsCreating(false)
  }

  const saveTutorial = () => {
    if (!editingTutorial) return

    const updatedTutorial = {
      ...editingTutorial,
      updatedAt: new Date()
    }

    if (isCreating) {
      saveTutorials([...tutorials, updatedTutorial])
    } else {
      saveTutorials(tutorials.map(t => t.id === updatedTutorial.id ? updatedTutorial : t))
    }

    setEditingTutorial(null)
    setIsCreating(false)
  }

  const deleteTutorial = (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer ce tutoriel ?')) {
      saveTutorials(tutorials.filter(t => t.id !== id))
    }
  }

  const toggleTutorialStatus = (id: string) => {
    saveTutorials(tutorials.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive, updatedAt: new Date() } : t
    ))
  }

  const addStep = () => {
    if (!editingTutorial) return

    const newStep: TutorialStep = {
      id: `step-${Date.now()}`,
      title: 'Nouvelle etape',
      description: 'Description de l\'etape',
      position: 'bottom',
      order: editingTutorial.steps.length + 1,
      videoUrl: '',
      videoTitle: ''
    }

    setEditingTutorial({
      ...editingTutorial,
      steps: [...editingTutorial.steps, newStep]
    })
  }

  const updateStep = (stepId: string, updates: Partial<TutorialStep>) => {
    if (!editingTutorial) return

    setEditingTutorial({
      ...editingTutorial,
      steps: editingTutorial.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    })
  }

  const deleteStep = (stepId: string) => {
    if (!editingTutorial) return

    setEditingTutorial({
      ...editingTutorial,
      steps: editingTutorial.steps.filter(step => step.id !== stepId)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/admin"
              className="flex items-center space-x-2 text-pink-500 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour a l'admin</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des Tutoriels
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Creez et gerez les tutoriels interactifs de votre plateforme
          </p>
        </div>

        {editingTutorial ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isCreating ? 'Creer un tutoriel' : 'Modifier le tutoriel'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingTutorial(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={saveTutorial}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Sauvegarder
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du tutoriel
                </label>
                <input
                  type="text"
                  value={editingTutorial.name}
                  onChange={(e) => setEditingTutorial({ ...editingTutorial, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Audience cible
                </label>
                <select
                  value={editingTutorial.targetAudience}
                  onChange={(e) => setEditingTutorial({ ...editingTutorial, targetAudience: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="new">Nouveaux utilisateurs</option>
                  <option value="premium">Utilisateurs premium</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={editingTutorial.description}
                onChange={(e) => setEditingTutorial({ ...editingTutorial, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Etapes du tutoriel ({editingTutorial.steps.length})
                </h3>
                <button
                  onClick={addStep}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1 inline" />
                  Ajouter une etape
                </button>
              </div>

              <div className="space-y-4">
                {editingTutorial.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Etape {index + 1}
                      </span>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Position
                        </label>
                        <select
                          value={step.position}
                          onChange={(e) => updateStep(step.id, { position: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        >
                          <option value="top">Haut</option>
                          <option value="bottom">Bas</option>
                          <option value="left">Gauche</option>
                          <option value="right">Droite</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => updateStep(step.id, { description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Element cible (selecteur CSS)
                      </label>
                      <input
                        type="text"
                        value={step.target || ''}
                        onChange={(e) => updateStep(step.id, { target: e.target.value })}
                        placeholder=".class-name ou #id-name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lien video (optionnel)
                      </label>
                      <input
                        type="url"
                        value={step.videoUrl || ''}
                        onChange={(e) => updateStep(step.id, { videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Titre de la video (optionnel)
                      </label>
                      <input
                        type="text"
                        value={step.videoTitle || ''}
                        onChange={(e) => updateStep(step.id, { videoTitle: e.target.value })}
                        placeholder="Titre descriptif de la video"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={createTutorial}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Creer un tutoriel
              </button>
            </div>

            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {tutorial.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {tutorial.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutorial.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {tutorial.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutorial.targetAudience === 'all' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      tutorial.targetAudience === 'new' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {tutorial.targetAudience === 'all' ? 'Tous' :
                       tutorial.targetAudience === 'new' ? 'Nouveaux' : 'Premium'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>{tutorial.steps.length} etapes</span>
                    {tutorial.steps.some(step => step.videoUrl) && (
                      <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <Video className="w-4 h-4" />
                        <span>{tutorial.steps.filter(step => step.videoUrl).length} video(s)</span>
                      </span>
                    )}
                  </div>
                  <span>Mis a jour le {tutorial.updatedAt.toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editTutorial(tutorial)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1 inline" />
                    Modifier
                  </button>
                  <button
                    onClick={() => toggleTutorialStatus(tutorial.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      tutorial.isActive
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {tutorial.isActive ? <Pause className="w-4 h-4 mr-1 inline" /> : <Play className="w-4 h-4 mr-1 inline" />}
                    {tutorial.isActive ? 'Desactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => deleteTutorial(tutorial.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1 inline" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
