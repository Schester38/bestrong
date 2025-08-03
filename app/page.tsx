"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAlert } from "./components/CustomAlert";
import { getCurrentUser } from "./utils/auth";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import Link from "next/link";
import { ArrowRight, Users, TrendingUp, Star, Zap, Share2, Heart, MessageCircle, Settings, LogOut, RefreshCw, Bell, Target, BarChart3, Brain, Megaphone, Construction, CheckCircle, Shield, Smartphone, Download } from "lucide-react";

// Composants critiques - chargés immédiatement
import ThemeToggle from "./components/ThemeToggle";
import ShareButton from "./components/ShareButton";
import LoadingSpinner from "./components/LoadingSpinner";

// Composants non critiques - lazy loading
const PhoneAuthModal = dynamic(() => import("./components/PhoneAuthModal"), { 
  ssr: false,
  loading: () => <LoadingSpinner />
});

const AnimatedBackground = dynamic(() => import("./components/AnimatedBackground"), { 
  ssr: false,
  loading: () => null
});

const LiveStats = dynamic(() => import("./components/LiveStats"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
});

const MotivationalPopup = dynamic(() => import("./components/MotivationalPopup"), {
  ssr: false
});

const NotificationPopup = dynamic(() => import("./components/NotificationPopup"), {
  ssr: false
});

const PWAInstallPrompt = dynamic(() => import("./components/PWAInstallPrompt"), {
  ssr: false
});

const PWAInstallInstructions = dynamic(() => import("./components/PWAInstallInstructions"), {
  ssr: false
});

const PWAStatus = dynamic(() => import("./components/PWAStatus"), {
  ssr: false
});

const NavigationArrows = dynamic(() => import("./components/NavigationArrows"), {
  ssr: false
});

const ScrollToTop = dynamic(() => import("./components/ScrollToTop"), {
  ssr: false
});

const ToastComponent = dynamic(() => import("./components/Toast"), {
  ssr: false
});





const ChatSystem = dynamic(() => import("./components/ChatSystem"), {
  ssr: false
});

const InteractiveTutorial = dynamic(() => import("./components/InteractiveTutorial"), {
  ssr: false
});

const AIDashboardWidget = dynamic(() => import("./components/AIDashboardWidget"), {
  ssr: false
});

const AINotification = dynamic(() => import("./components/AINotification"), {
  ssr: false 
});

// Composants d'animations avancées
const AnimationWrapper = dynamic(() => import("./components/AnimationWrapper"), {
  ssr: false 
});

export default function Home() {
  const { isDark } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const { toasts, removeToast, success, error, info, warning } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<"login" | "register" | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Effet de scroll pour la barre de progression
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(Math.min(scrollPercent, 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction de fallback pour le partage
  const fallbackShare = useCallback((shareData: { title: string; text: string; url: string }) => {
    const message = `${shareData.title}\n\n${shareData.text} ${shareData.url}`;
    
    // Essayer de copier dans le presse-papiers
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message)
        .then(() => {
          // Afficher une notification de succès
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('BE STRONG', {
              body: 'Lien copié ! Partage-le avec tes amis',
              icon: '/icon-512.png'
            });
          } else {
            showAlert("✅ Lien copié ! Partage-le avec tes amis :\n\n" + message, "success");
          }
        })
        .catch(() => {
          // Fallback si la copie échoue
          showAlert("📱 Partage BE STRONG :\n\n" + message, "info");
        });
    } else {
      // Fallback pour les navigateurs plus anciens
      showAlert("📱 Partage BE STRONG :\n\n" + message, "info");
    }
  }, []);

  // Optimisation du fetch avec useCallback et interval plus long
  const fetchUserCount = useCallback(async () => {
    try {
      const response = await fetch('/api/users/count', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=120', // Cache pendant 2 minutes
        },
      });
      const data = await response.json();
      setUserCount(data.count);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs:", error);
      // Si on ne peut pas récupérer les données, activer le mode maintenance
      setIsMaintenanceMode(true);
    }
  }, []);

  // Fetch le nombre d'utilisateurs au chargement et toutes les 60 secondes (au lieu de 30)
  useEffect(() => {
    fetchUserCount(); // Premier appel
    const interval = setInterval(fetchUserCount, 60000); // Polling toutes les 60 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, [fetchUserCount]);

  // Redirection vers la page de maintenance si nécessaire
  useEffect(() => {
    if (isMaintenanceMode) {
      window.location.href = '/maintenance';
    }
  }, [isMaintenanceMode]);


  useEffect(() => {
    // Marquer que nous sommes côté client
    setIsClient(true);
    
    // Charger les informations de l'utilisateur connecté depuis le localStorage
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser");
      if (user) {
        try {
          setCurrentUser(JSON.parse(user));
        } catch {
          setCurrentUser(null);
        }
      }
    }

    // Demander les permissions de notification pour l'app PWA
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center">
      {/* Barre de progression de scroll */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 origin-left z-50 transition-transform duration-100" 
           style={{ transform: `scaleX(${scrollProgress})` }} />
      
      {isClient && <AnimatedBackground />}
      
      {/* Header */}
      <header className="w-full flex justify-center items-center py-4 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-center items-center space-x-4 w-full max-w-7xl">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              BE STRONG
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            <ThemeToggle />
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModalOpen("login")}
                  className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
                >
                  <span>Connexion</span>
                </button>
                <button
                  onClick={() => setModalOpen("register")}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center space-x-1 shadow-lg hover:shadow-xl"
                >
                  <span>Inscription</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bouton ESSAIE GRATUIT pour 45 jours en haut de la page */}
      <div className="w-full flex justify-center mt-6">
        <div className="max-w-7xl px-2 sm:px-4 lg:px-8">
          <button
            onClick={() => setModalOpen("register")}
            className="bg-white text-pink-600 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-full text-sm sm:text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
          >
            <span className="hidden sm:inline">ESSAIE GRATUIT pour 45 jours</span>
            <span className="sm:hidden">ESSAI GRATUIT 45j</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {modalOpen && (
        <PhoneAuthModal
          open={!!modalOpen}
          onClose={() => setModalOpen(null)}
          mode={modalOpen}
          onModeChange={(newMode) => setModalOpen(newMode)}
        />
      )}

      {/* Hero Section avec animations avancées */}
      <section className="relative py-10 sm:py-16 lg:py-20 px-2 sm:px-4 lg:px-8 w-full flex justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        {/* Fond constellation */}
        <div className="absolute inset-0 constellation-bg opacity-25"></div>
        
        {/* Particules interactives en arrière-plan */}
        {isClient && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="particle-field">
              {[...Array(40)].map((_, i) => {
                const colors = [
                  'linear-gradient(45deg, #ff0080, #8b5cf6, #00d4ff)',
                  'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
                  'linear-gradient(45deg, #a8edea, #fed6e3, #ff9a9e)',
                  'linear-gradient(45deg, #ffecd2, #fcb69f, #ff9a9e)'
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div
                    key={i}
                    className="particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 10 + 8}px`,
                      height: `${Math.random() * 10 + 8}px`,
                      background: randomColor,
                      animationDelay: `${Math.random() * 6}s`,
                      animationDuration: `${6 + Math.random() * 4}s`
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        <div className="max-w-7xl text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
            <span className="text-shimmer">
              Boostez votre
            </span>
            <br />
            <span className="text-gray-900 dark:text-white neon-glow">visibilité TikTok</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2 scroll-reveal">
            Augmentez vos abonnés, vues et likes de manière éthique grâce à notre plateforme d&apos;échanges organiques et nos outils d&apos;optimisation.
          </p>
          
          {/* Boutons d'action centrés avec animations */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-stretch px-2">
            <a href="https://youtu.be/Uwh_izubcEw" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl lg:text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto hover-lift morph-button">
              <span className="hidden sm:inline">Présentation BE STRONG</span>
              <span className="sm:hidden">Présentation</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 bounce-smooth" />
            </a>
            
            <Link href="/don" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl lg:text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto hover-lift morph-button">
              Faire un don
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 bounce-smooth" />
            </Link>
            
            <div className="w-full sm:w-auto">
              <ShareButton 
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl lg:text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap w-full h-full hover-lift morph-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="hidden sm:inline">Partager BE STRONG</span>
                <span className="sm:hidden">Partager</span>
              </ShareButton>
            </div>
          </div>

          {/* Compteur d'utilisateurs centré */}
          <div className="mt-6 sm:mt-8 flex justify-center px-2">
            <div className="relative px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-2xl shadow-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex flex-col items-center border-4 border-white dark:border-gray-900 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white drop-shadow animate-pulse">{userCount ?? '...'}</span>
              </div>
              <div className="text-white text-sm sm:text-base font-medium tracking-wide">utilisateurs inscrits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques en temps réel */}
      <section className="py-8 sm:py-10 lg:py-12 px-2 sm:px-4 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600 relative w-full flex justify-center">
        {/* Fond constellation */}
        <div className="absolute inset-0 constellation-bg opacity-30"></div>
        <div className="max-w-7xl relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Statistiques en temps réel
            </h2>
            <p className="text-pink-100 text-sm sm:text-base">
              Découvrez l'impact de BE STRONG sur la communauté TikTok
            </p>
          </div>
          <div className="flex justify-center">
            <LiveStats />
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-2 sm:px-4 lg:px-8 bg-white dark:bg-gray-900 w-full flex justify-center relative">
        {/* Fond constellation */}
        <div className="absolute inset-0 constellation-bg opacity-20"></div>
        <div className="max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour réussir sur TikTok
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 depth-card hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 floating-element">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-shimmer">
                Échanges organiques
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Gagnez des crédits en interagissant avec d&apos;autres comptes et utilisez-les pour recevoir des engagements sur vos vidéos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 depth-card hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 floating-element">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-shimmer">
                100% Sécurisé
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Conformité RGPD et respect des conditions d&apos;utilisation de TikTok. Protection contre les abus et les bots (faux comptes).
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 depth-card hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 floating-element">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-shimmer">
                Communauté active
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Forum d&apos;entraide, challenges hebdomadaires et conseils d&apos;experts pour maximiser votre croissance.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-600 depth-card hover-lift">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 sm:mb-6 floating-element">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-shimmer">
                Recommandations IA
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Conseils automatisés pour les hashtags, heures de posting et optimisation de contenu basés sur l&apos;IA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-2 sm:px-4 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600 w-full flex justify-center relative">
        {/* Fond constellation */}
        <div className="absolute inset-0 constellation-bg opacity-30"></div>
        <div className="max-w-4xl text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Prêt à booster votre visibilité TikTok ?
          </h2>
          <p className="text-lg sm:text-xl text-pink-100 mb-6 sm:mb-8">
            Rejoignez des milliers de créateurs qui ont déjà augmenté leur audience de manière éthique
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setModalOpen("register")}
              className="bg-white text-pink-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
            >
              <span className="hidden sm:inline">ESSAIE GRATUIT pour 45 jours</span>
              <span className="sm:hidden">ESSAI GRATUIT 45j</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Fond constellation */}
        <div className="absolute inset-0 constellation-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-row flex-wrap justify-between gap-4 w-full">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                BE STRONG
              </h3>
              <p className="text-gray-400">
                La plateforme éthique pour augmenter votre visibilité TikTok.
              </p>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Produit</h4>
              <ul className="space-y-1 text-gray-400 text-xs sm:text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Support</h4>
              <ul className="space-y-1 text-gray-400 text-xs sm:text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Aide</Link></li>
                <li><a href="https://wa.me/672886348" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Légal</h4>
              <ul className="space-y-1 text-gray-400 text-xs sm:text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">RGPD</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold mb-2 text-sm sm:text-base">Administration</h4>
              <ul className="space-y-1 text-gray-400 text-xs sm:text-sm">
                <li><Link href="/admin" className="hover:text-white transition-colors">Gestion utilisateurs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BE STRONG. Tous droits réservés.</p>
          </div>
        </div>


      </footer>
      <NavigationArrows />
      <PWAInstallPrompt />
      <PWAInstallInstructions />
      <PWAStatus />
      
      {/* Chat System en position fixe à gauche */}
      <div className="fixed bottom-24 left-4 z-50">
        {currentUser && <ChatSystem userId={currentUser?.id} />}
      </div>
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}

      {/* Tutoriel interactif */}
      <InteractiveTutorial
        tutorialId="welcome-tutorial"
        steps={[
          {
            id: 'welcome',
            title: 'Bienvenue sur BE STRONG !',
            description: 'Découvrez comment utiliser notre plateforme pour maximiser votre présence TikTok.',
            position: 'bottom'
          },
          {
            id: 'features',
            title: 'Fonctionnalités principales',
            description: 'Explorez nos outils de création de contenu, d\'analyse et de gamification.',
            target: '.features-section',
            position: 'top'
          },
          {
            id: 'dashboard',
            title: 'Tableau de bord',
            description: 'Accédez à vos statistiques, badges et tâches depuis le tableau de bord.',
            target: 'a[href="/dashboard"]',
            position: 'bottom'
          },
          {
            id: 'chat',
            title: 'Support en ligne',
            description: 'Besoin d\'aide ? Notre équipe est disponible 24/7 via le chat.',
            target: '.chat-button',
            position: 'left'
          }
        ]}
        onComplete={() => {
          success('Tutoriel terminé !', 'Vous êtes maintenant prêt à utiliser BE STRONG.')
        }}
        onSkip={() => {
          info('Tutoriel ignoré', 'Vous pouvez le relancer à tout moment depuis le bouton d\'aide.')
        }}
      />
    </div>
  );
}
