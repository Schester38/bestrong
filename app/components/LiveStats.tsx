"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Heart } from 'lucide-react';

export default function LiveStats() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [stats, setStats] = useState({
    followers: 0,
    likes: 0,
    views: 0,
    engagement: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // Vérifier si le composant est visible dans le viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector('.live-stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  // Fonction pour récupérer le nombre d'utilisateurs
  const fetchUserCount = async () => {
    try {
      const response = await fetch('/api/users/count', {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=60', // Cache pendant 1 minute
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.count && data.count !== userCount) {
        setUserCount(data.count);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre d'utilisateurs:", error);
    }
  };

  // Fonction pour générer un texte intelligent basé sur le nombre d'utilisateurs
  const getUserStatusText = (count: number) => {
    if (count < 100) {
      return "Pionniers";
    } else if (count < 500) {
      return "Communauté en croissance";
    } else if (count < 1000) {
      return "Utilisateurs actifs";
    } else if (count < 2000) {
      return "Communauté florissante";
    } else if (count < 5000) {
      return "Réseau dynamique";
    } else if (count < 10000) {
      return "Écosystème TikTok";
    } else {
      return "Empire social";
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    
    // Récupérer le nombre d'utilisateurs au chargement
    fetchUserCount();
    
    // Mettre à jour le nombre d'utilisateurs toutes les 60 secondes (au lieu de 10)
    const userCountInterval = setInterval(fetchUserCount, 60000);
    
    // Simuler des statistiques en temps réel toutes les 10 secondes (au lieu de 3)
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        followers: prev.followers + Math.floor(Math.random() * 3) + 1,
        likes: prev.likes + Math.floor(Math.random() * 10) + 2,
        views: prev.views + Math.floor(Math.random() * 50) + 5,
        engagement: Math.floor(Math.random() * 10) + 85
      }));
    }, 10000);

    return () => {
      clearInterval(userCountInterval);
      clearInterval(statsInterval);
    };
  }, [isVisible]);

  // Effet pour animer le compteur d'utilisateurs
  useEffect(() => {
    if (userCount !== null) {
      const targetCount = userCount;
      const startCount = displayCount;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fonction d'easing pour une animation plus fluide
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentCount = Math.floor(startCount + (targetCount - startCount) * easeOutQuart);
        setDisplayCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [userCount]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="live-stats-section py-2 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white/10 backdrop-blur-lg rounded-md p-6 border border-white/20 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-pink-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(displayCount)}
              </div>
              <div className="text-sm text-gray-300">
                {userCount ? getUserStatusText(userCount) : 'Chargement...'}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-md p-6 border border-white/20 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(stats.followers)}
              </div>
              <div className="text-sm text-gray-300">Nouveaux abonnés</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-md p-6 border border-white/20 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(stats.likes)}
              </div>
              <div className="text-sm text-gray-300">J'aime générés</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-md p-6 border border-white/20 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {formatNumber(stats.views)}
              </div>
              <div className="text-sm text-gray-300">Vues totales</div>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center">
          <div className="inline-flex items-center space-x-1 bg-green-500/20 backdrop-blur-lg rounded-full px-1.5 py-0.5 border border-green-500/30">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">
              Engagement: {stats.engagement}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
} 