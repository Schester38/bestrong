"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const motivationalMessages = [
  "Tu es plus fort que tes excuses",
  "Chaque jour est une nouvelle opportunite",
  "Ta visibilite TikTok va exploser",
  "Tu as le pouvoir de reussir",
  "Concentre-toi sur tes objectifs",
  "La perseverance transforme les reves",
  "Tu es ne pour briller",
  "Chaque follower est un pas vers le succes",
  "Tu es unique",
  "Le monde attend de voir ton talent",
  "Aujourd'hui tu vas creer quelque chose d'incroyable",
  "La confiance en soi est ta meilleure arme",
  "Pret a conquerir TikTok",
  "Ta creativite n'a pas de limites",
  "Le succes est a portee de main",
  "Crois en toi",
  "Tu es le heros de ta propre histoire",
  "Chaque video te rapproche de tes reves",
  "Ton authenticite est ta force",
  "Le monde a besoin de ta voix",
  "Transforme tes defis en opportunites",
  "Tu as tout ce qu'il faut pour reussir",
  "Prepare-toi a devenir viral",
  "Ta passion va inspirer des millions",
  "Aujourd'hui tu vas faire la difference",
  "Tu es plus fort que tu ne le penses",
  "Le moment est venu de briller",
  "Chaque like est une validation",
  "Tu es une etoile qui s'ignore",
  "Le monde a besoin de ton energie",
  "Tu es une force de la nature",
  "Rien ne peut t'arreter maintenant",
  "Tu vas creer un tsunami de followers",
  "Ton potentiel est infini",
  "Tu es ne pour etre viral",
  "Ta lumiere va eclairer le monde",
  "Tu es electrisant",
  "Tu vas devenir une icone",
  "Tu es un diamant brut",
  "Prepare-toi a la celebrite",
  "Defie tes limites",
  "Tu es capable de l'impossible",
  "Ton ascension commence maintenant",
  "Tu vas surprendre tout le monde",
  "Tes reves deviennent realite",
  "Tu es en train de creer ta legende",
  "Tu es une tempete de creativite",
  "Tu vas conquerir le monde",
  "Tu es un phenomene",
  "Le monde va te decouvrir",
  "Ton energie positive est contagieuse",
  "Tu inspires les autres",
  "Tu vas creer un mouvement",
  "Tu es un catalyseur de changement",
  "Tu vas revolutionner TikTok",
  "Tu es un leader ne",
  "Tu electrises ton audience",
  "Tu vas creer une communaute",
  "Tu es un influenceur naturel",
  "Tu vas devenir une reference",
  "Le succes est ton destin",
  "Tu vas atteindre les sommets",
  "Tu vas devenir une star",
  "Tu es fait pour briller",
  "Tu vas realiser tes reves",
  "Tu es sur la voie du succes",
  "Tu vas exploser en popularite",
  "Tu vas gagner la partie",
  "Tu vas devenir celebre",
  "Tu vas conquerir les reseaux",
  "TU ES UNE MACHINE DE GUERRE",
  "PERSONNE NE PEUT T'ARRETER",
  "TU VAS DEVENIR UNE LEGENDE",
  "TU ES LE ROI DE TIKTOK",
  "TU VAS DOMINER LE MONDE",
  "TU ES UN PHENOMENE",
  "TU ES ELECTRIQUE",
  "TU VAS TOUT DETRUIRE",
  "TU ES UN DIAMANT",
  "TU VAS DEVENIR UNE ICONE",
  "Aujourd'hui tu vas tout changer",
  "Ce jour est ton jour de gloire",
  "Tu vas creer l'histoire",
  "Tu vas impressionner le monde",
  "Tu vas realiser l'impossible",
  "Tu vas eblouir ton audience",
  "Tu vas creer un buzz",
  "Tu vas gagner la bataille",
  "Tu vas briller comme jamais",
  "Tu vas devenir une star",
  "TU ES PRET A CONQUERIR LE MONDE",
  "RIEN NE PEUT T'ARRÊTER MAINTENANT",
  "TU VAS DEVENIR UNE LEGENDE VIVANTE",
  "TU ES LE FUTUR DE TIKTOK",
  "TU VAS REVOLUTIONNER L'INFLUENCE",
  "TU ES UN PHENOMENE MONDIAL",
  "TU VAS ELECTRISER LE MONDE",
  "TU VAS DEVENIR UNE ICONE",
  "TU ES UN TRESOR NATIONAL",
  "TU VAS CONQUERIR L'UNIVERS"
];

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
      case 1: return "MOTIVATION DEBUTANT";
      case 2: return "MOTIVATION INTERMEDIAIRE";
      case 3: return "MOTIVATION AVANCE";
      case 4: return "MOTIVATION EXPERT";
      default: return "MOTIVATION DU JOUR";
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