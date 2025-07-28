"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motivationalMessages } from '../data/motivationalMessages';

export default function MotivationalPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    // Afficher le popup après 3 secondes
    const timer = setTimeout(() => {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setMessage(randomMessage);
      
      // Calculer le niveau utilisateur basé sur le nombre de visites
      const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
      localStorage.setItem('visitCount', visitCount.toString());
      
      if (visitCount < 10) setUserLevel(1);
      else if (visitCount < 30) setUserLevel(2);
      else if (visitCount < 60) setUserLevel(3);
      else setUserLevel(4);
      
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getTitleForLevel = () => {
    switch (userLevel) {
      case 1: return "🌟 MOTIVATION DEBUTANT";
      case 2: return "💪 MOTIVATION INTERMEDIAIRE";
      case 3: return "🔥 MOTIVATION AVANCE";
      case 4: return "👑 MOTIVATION EXPERT";
      default: return "✨ MOTIVATION DU JOUR";
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in-up">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Icône de motivation */}
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          {/* Titre */}
          <h3 className="text-xl font-bold text-white">
            {getTitleForLevel()}
          </h3>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-center text-lg leading-relaxed mb-6">
            {message}
          </p>
          
          {/* Bouton d'action */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            C'EST PARTI !
          </button>
        </div>
      </div>
    </div>
  );
} 