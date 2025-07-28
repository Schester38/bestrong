"use client";

import Link from "next/link";
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react";
import ScrollToTop from "./components/ScrollToTop";
import ThemeToggle from "./components/ThemeToggle";
import MotivationalPopup from "./components/MotivationalPopup";
import ShareButton from "./components/ShareButton";
import AnimatedBackground from "./components/AnimatedBackground";
import LiveStats from "./components/LiveStats";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

const PhoneAuthModal = dynamic(() => import("./components/PhoneAuthModal"), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
});

export default function Home() {
  const [modalOpen, setModalOpen] = useState<null | "login" | "register">(null);
  // Compteur d'utilisateurs inscrits
  const [userCount, setUserCount] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{ phone: string; pseudo?: string } | null>(null);

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
            alert("✅ Lien copié ! Partage-le avec tes amis :\n\n" + message);
          }
        })
        .catch(() => {
          // Fallback si la copie échoue
          alert("📱 Partage BE STRONG :\n\n" + message);
        });
    } else {
      // Fallback pour les navigateurs plus anciens
      alert("📱 Partage BE STRONG :\n\n" + message);
    }
  }, []);

  // Optimisation du fetch avec useCallback et interval plus long
  const fetchUserCount = useCallback(async () => {
    try {
      const response = await fetch('/api/users/count', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      setUserCount(data.count);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs:", error);
    }
  }, []);

  // Fetch le nombre d'utilisateurs au chargement et toutes les 30 secondes (au lieu de 10)
  useEffect(() => {
    fetchUserCount(); // Premier appel
    const interval = setInterval(fetchUserCount, 30000); // Polling toutes les 30 secondes

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, [fetchUserCount]);


  useEffect(() => {
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

    // Demander les permissions de notification pour l'app Android
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-16">
            <div className="flex items-center -ml-2 sm:ml-0">
              <img 
                src="/icon-512.png" 
                alt="BE STRONG Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 mr-2"
              />
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                BE STRONG
              </h1>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-0">
              {/* Sélecteur de thème */}
              <ThemeToggle />
              
              {currentUser ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("currentUser");
                      setCurrentUser(null);
                      window.location.href = "/";
                    }}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModalOpen("login")}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => setModalOpen("register")}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Bouton ESSAIE GRATUIT pour 45 jours en haut de la page */}
      <div className="w-full flex justify-center mt-6">
        <button
          onClick={() => setModalOpen("register")}
          className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
        >
          ESSAIE GRATUIT pour 45 jours
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      {modalOpen && (
        <PhoneAuthModal
          open={!!modalOpen}
          onClose={() => setModalOpen(null)}
          mode={modalOpen}
          onModeChange={(newMode) => setModalOpen(newMode)}
        />
      )}
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Boostez votre
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">visibilité TikTok</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Augmentez vos abonnés, vues et likes de manière éthique grâce à notre plateforme d&apos;échanges organiques et nos outils d&apos;optimisation.
          </p>
          <div className="flex flex-row flex-wrap gap-4 justify-center">
            <a href="https://youtu.be/Uwh_izubcEw" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap">
              Présentation BE STRONG
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          {/* Ajout du bouton Faire un don */}
          <div className="flex flex-row flex-wrap gap-4 justify-center mt-4">
            <Link href="/don" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-full text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap">
              Faire un don
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* Bouton de téléchargement APK */}
          <div className="flex flex-row flex-wrap gap-4 justify-center mt-4">
            <a href="/apk/BeStrong-certified.apk" download className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap">
              Télécharger l&apos;App Android
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <div className="flex justify-center mt-2">
            <ShareButton 
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-semibold hover:shadow-xl transition-all duration-1000 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Partager BE STRONG
            </ShareButton>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="relative px-8 py-5 rounded-2xl shadow-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 flex flex-col items-center border-4 border-white dark:border-gray-900 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-4xl font-extrabold text-white drop-shadow animate-pulse">{userCount ?? '...'}</span>
              </div>
              <div className="text-white text-base font-medium tracking-wide">utilisateurs inscrits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistiques en temps réel */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Statistiques en temps réel
            </h2>
            <p className="text-pink-100">
              Découvrez l'impact de BE STRONG sur la communauté TikTok
            </p>
          </div>
          <LiveStats userCount={userCount} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour réussir sur TikTok
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Échanges organiques
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Gagnez des crédits en interagissant avec d&apos;autres comptes et utilisez-les pour recevoir des engagements sur vos vidéos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                100% Sécurisé
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conformité RGPD et respect des conditions d&apos;utilisation de TikTok. Protection contre les abus et les bots (faux comptes).
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Communauté active
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Forum d&apos;entraide, challenges hebdomadaires et conseils d&apos;experts pour maximiser votre croissance.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl border border-gray-200 dark:border-gray-600">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recommandations IA
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conseils automatisés pour les hashtags, heures de posting et optimisation de contenu basés sur l&apos;IA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à booster votre visibilité TikTok ?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Rejoignez des milliers de créateurs qui ont déjà augmenté leur audience de manière éthique
          </p>
          <button
            onClick={() => setModalOpen("register")}
            className="bg-white text-pink-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
          >
            ESSAIE GRATUIT pour 45 jours
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
      <ScrollToTop />
      <MotivationalPopup />
    </div>
  );
}
