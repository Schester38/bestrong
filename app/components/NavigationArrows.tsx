'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NavigationArrows() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Tous les Hooks doivent être appelés avant tout return conditionnel
  const [currentTab, setCurrentTab] = useState('exchange');
  const [tabHistory, setTabHistory] = useState<string[]>(['exchange']);

  // Configuration des onglets du dashboard
  const dashboardTabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'exchange', label: 'Échanges' },
    { id: 'boost', label: 'Boosting' },
    { id: 'messages', label: 'Messages' },
    { id: 'ai', label: 'IA' }
  ];

  // Détecter l'onglet actuel basé sur les classes CSS
  useEffect(() => {
    // Ne s'exécuter que sur le dashboard
    if (pathname !== '/dashboard') return;

    const detectCurrentTab = () => {
      // Chercher le bouton actif par sa classe bg-pink-500
      const activeButton = document.querySelector('button.bg-pink-500') as HTMLElement;
      if (activeButton) {
        // Essayer de déterminer l'onglet basé sur le texte du bouton
        const buttonText = activeButton.textContent?.trim().toLowerCase();
        if (buttonText) {
          let newTab = 'exchange'; // défaut
          if (buttonText.includes('vue') || buttonText.includes('ensemble')) {
            newTab = 'overview';
          } else if (buttonText.includes('échanges')) {
            newTab = 'exchange';
          } else if (buttonText.includes('boosting')) {
            newTab = 'boost';
          } else if (buttonText.includes('messages')) {
            newTab = 'messages';
          } else if (buttonText.includes('ia')) {
            newTab = 'ai';
          }
          
          if (newTab !== currentTab) {
            setCurrentTab(newTab);
            // Ajouter à l'historique seulement si c'est un nouvel onglet
            setTabHistory(prev => {
              if (prev[prev.length - 1] !== newTab) {
                return [...prev, newTab];
              }
              return prev;
            });
          }
        }
      }
    };

    detectCurrentTab();
    
    // Observer les changements dans les boutons
    const observer = new MutationObserver(detectCurrentTab);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [currentTab, pathname]);

  // Navigation par clavier seulement
  useEffect(() => {
    // Ne s'exécuter que sur le dashboard
    if (pathname !== '/dashboard') return;

    const currentIndex = dashboardTabs.findIndex(tab => tab.id === currentTab);
    const nextTab = currentIndex < dashboardTabs.length - 1 ? dashboardTabs[currentIndex + 1] : null;

    const navigateToTab = (tabId: string) => {
      // Chercher le bouton par son texte
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        const buttonText = button.textContent?.trim().toLowerCase();
        if (buttonText) {
          if (tabId === 'overview' && (buttonText.includes('vue') || buttonText.includes('ensemble'))) {
            button.click();
            break;
          } else if (tabId === 'exchange' && buttonText.includes('échanges')) {
            button.click();
            break;
          } else if (tabId === 'boost' && buttonText.includes('boosting')) {
            button.click();
            break;
          } else if (tabId === 'messages' && buttonText.includes('messages')) {
            button.click();
            break;
          } else if (tabId === 'ai' && buttonText.includes('ia')) {
            button.click();
            break;
          }
        }
      }
    };

    const goToPreviousTab = () => {
      if (tabHistory.length > 1) {
        const previousTab = tabHistory[tabHistory.length - 2];
        navigateToTab(previousTab);
        setTabHistory(prev => prev.slice(0, -1));
      }
    };

    const goToNextTab = () => {
      if (nextTab) {
        navigateToTab(nextTab.id);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && tabHistory.length > 1) {
        event.preventDefault();
        goToPreviousTab();
      } else if (event.key === 'ArrowRight' && nextTab) {
        event.preventDefault();
        goToNextTab();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabHistory, currentTab, pathname]);

  // Ne s'afficher que sur le dashboard
  if (pathname !== '/dashboard') {
    return null;
  }

  const currentIndex = dashboardTabs.findIndex(tab => tab.id === currentTab);
  const prevTab = currentIndex > 0 ? dashboardTabs[currentIndex - 1] : null;
  const nextTab = currentIndex < dashboardTabs.length - 1 ? dashboardTabs[currentIndex + 1] : null;

  const navigateToTab = (tabId: string) => {
    // Chercher le bouton par son texte
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      const buttonText = button.textContent?.trim().toLowerCase();
      if (buttonText) {
        if (tabId === 'overview' && (buttonText.includes('vue') || buttonText.includes('ensemble'))) {
          button.click();
          break;
        } else if (tabId === 'exchange' && buttonText.includes('échanges')) {
          button.click();
          break;
        } else if (tabId === 'boost' && buttonText.includes('boosting')) {
          button.click();
          break;
        } else if (tabId === 'messages' && buttonText.includes('messages')) {
          button.click();
          break;
        } else if (tabId === 'ai' && buttonText.includes('ia')) {
          button.click();
          break;
        }
      }
    }
  };

  const goToPreviousTab = () => {
    if (tabHistory.length > 1) {
      const previousTab = tabHistory[tabHistory.length - 2];
      navigateToTab(previousTab);
      setTabHistory(prev => prev.slice(0, -1));
    }
  };

  const goToNextTab = () => {
    if (nextTab) {
      navigateToTab(nextTab.id);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-4">
      {/* Flèche gauche - Onglet précédent */}
      <button
        onClick={goToPreviousTab}
        disabled={tabHistory.length <= 1}
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg border transition-all duration-200 group ${
          tabHistory.length > 1
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
        }`}
        title={tabHistory.length > 1 ? `Onglet précédent (←)` : 'Aucun onglet précédent'}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Précédent
        </span>
      </button>

      {/* Indicateur d'onglet */}
      <div className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {dashboardTabs.find(tab => tab.id === currentTab)?.label || 'Dashboard'}
        </span>
      </div>

      {/* Flèche droite - Onglet suivant */}
      <button
        onClick={goToNextTab}
        disabled={!nextTab}
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg border transition-all duration-200 group ${
          nextTab
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
        }`}
        title={nextTab ? `Onglet suivant: ${nextTab.label} (→)` : 'Aucun onglet suivant'}
      >
        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {nextTab ? nextTab.label : 'Suivant'}
        </span>
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
      </button>
    </div>
  );
} 