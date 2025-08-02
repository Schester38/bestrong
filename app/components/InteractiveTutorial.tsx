'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, X, HelpCircle, CheckCircle, ArrowRight, ArrowLeft, Video, ExternalLink } from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // Sélecteur CSS de l'élément à mettre en surbrillance
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'scroll'
  completed?: boolean
  videoUrl?: string
  videoTitle?: string
}

interface InteractiveTutorialProps {
  tutorialId: string
  steps: TutorialStep[]
  onComplete?: () => void
  onSkip?: () => void
  className?: string
}

const InteractiveTutorial = ({ 
  tutorialId, 
  steps, 
  onComplete, 
  onSkip, 
  className = '' 
}: InteractiveTutorialProps) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStepData = steps[currentStep]

  useEffect(() => {
    // Vérifier si le tutoriel a déjà été vu
    const hasSeenTutorial = localStorage.getItem(`tutorial-${tutorialId}`)
    if (!hasSeenTutorial) {
      setIsActive(true)
    }
  }, [tutorialId])

  useEffect(() => {
    if (isActive && currentStepData?.target) {
      highlightElement(currentStepData.target)
    }
  }, [isActive, currentStep])

  const highlightElement = (selector: string) => {
    // Supprimer les surbrillances précédentes
    const existingHighlights = document.querySelectorAll('.tutorial-highlight')
    existingHighlights.forEach(el => {
      el.classList.remove('tutorial-highlight')
      const htmlEl = el as HTMLElement
      htmlEl.style.outline = ''
      htmlEl.style.outlineOffset = ''
    })

    // Ajouter la nouvelle surbrillance
    const targetElement = document.querySelector(selector)
    if (targetElement) {
      targetElement.classList.add('tutorial-highlight')
      const htmlEl = targetElement as HTMLElement
      htmlEl.style.outline = '3px solid #ec4899'
      htmlEl.style.outlineOffset = '2px'
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTutorial()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
    nextStep()
  }

  const completeTutorial = () => {
    setIsActive(false)
    localStorage.setItem(`tutorial-${tutorialId}`, 'completed')
    
    // Supprimer les surbrillances
    const highlights = document.querySelectorAll('.tutorial-highlight')
    highlights.forEach(el => {
      el.classList.remove('tutorial-highlight')
      const htmlEl = el as HTMLElement
      htmlEl.style.outline = ''
      htmlEl.style.outlineOffset = ''
    })

    onComplete?.()
  }

  const skipTutorial = () => {
    setIsActive(false)
    localStorage.setItem(`tutorial-${tutorialId}`, 'skipped')
    onSkip?.()
  }

  const resetTutorial = () => {
    localStorage.removeItem(`tutorial-${tutorialId}`)
    setIsActive(true)
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className={`fixed bottom-4 left-4 z-50 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        title="Afficher le tutoriel"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={skipTutorial} />

      {/* Tutoriel */}
      <div className="fixed z-50 max-w-md mx-4">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${
            currentStepData?.position === 'top' ? 'bottom-full mb-4' :
            currentStepData?.position === 'bottom' ? 'top-full mt-4' :
            currentStepData?.position === 'left' ? 'right-full mr-4' :
            'left-full ml-4'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Tutoriel
              </h3>
            </div>
            <button
              onClick={skipTutorial}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {currentStepData?.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStepData?.description}
              </p>
              
              {/* Bouton vidéo */}
              {currentStepData?.videoUrl && (
                <div className="mt-3">
                  <button
                    onClick={() => window.open(currentStepData.videoUrl, '_blank', 'noopener,noreferrer')}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>{currentStepData.videoTitle || 'Voir la vidéo'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Progression */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <div className="flex items-center space-x-2">
                  <span>Étape {currentStep + 1} sur {steps.length}</span>
                  {currentStepData?.videoUrl && (
                    <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                      <Video className="w-3 h-3" />
                      <span>Vidéo disponible</span>
                    </span>
                  )}
                </div>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={skipTutorial}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Passer
                </button>
                <button
                  onClick={completeStep}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
                >
                  {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flèche de positionnement */}
        <div
          className={`absolute w-0 h-0 border-8 border-transparent ${
            currentStepData?.position === 'top' ? 'top-full border-t-white dark:border-t-gray-800' :
            currentStepData?.position === 'bottom' ? 'bottom-full border-b-white dark:border-b-gray-800' :
            currentStepData?.position === 'left' ? 'left-full border-l-white dark:border-l-gray-800' :
            'right-full border-r-white dark:border-r-gray-800'
          }`}
        />
      </div>

      {/* Styles CSS pour les surbrillances */}
      <style jsx>{`
        .tutorial-highlight {
          position: relative;
          z-index: 51;
        }
        .tutorial-highlight::after {
          content: '';
          position: absolute;
          inset: -4px;
          background: rgba(236, 72, 153, 0.1);
          border-radius: inherit;
          z-index: -1;
        }
      `}</style>
    </>
  )
}

export default InteractiveTutorial 