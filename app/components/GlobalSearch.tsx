'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Command } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'task' | 'user' | 'page'
  url: string
}

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Raccourci clavier Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus sur l'input quand ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Recherche
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const searchResults: SearchResult[] = [
      {
        id: '1',
        title: 'Tableau de bord',
        description: 'Accéder au tableau de bord',
        type: 'page',
        url: '/dashboard'
      },
      {
        id: '2',
        title: 'Tâches d\'échange',
        description: 'Voir les tâches disponibles',
        type: 'task',
        url: '/dashboard?tab=tasks'
      },
      {
        id: '3',
        title: 'Messagerie',
        description: 'Accéder à la messagerie',
        type: 'page',
        url: '/dashboard?tab=messages'
      }
    ]

    const filtered = searchResults.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )

    setResults(filtered)
    setIsLoading(false)
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Recherche en cours...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Tapez pour rechercher...
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Utilisez ↑↓ pour naviguer, Entrée pour sélectionner</span>
            <div className="flex items-center space-x-2">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch 