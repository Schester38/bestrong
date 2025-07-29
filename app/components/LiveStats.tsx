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

  // Fonction pour récupérer le nombre d'utilisateurs
  const fetchUserCount = async () => {
    try {
      console.log('🔄 Récupération du nombre d\'utilisateurs...');
      const response = await fetch('/api/users/count', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Nombre d\'utilisateurs reçu:', data.count);
      
      if (data.count && data.count !== userCount) {
        setUserCount(data.count);
        console.log('✅ Nombre d\'utilisateurs mis à jour:', data.count);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du nombre d'utilisateurs:", error);
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
    console.log('🚀 Initialisation du composant LiveStats');
    
    // Récupérer le nombre d'utilisateurs au chargement
    fetchUserCount();
    
    // Mettre à jour le nombre d'utilisateurs toutes les 10 secondes (au lieu de 30)
    const userCountInterval = setInterval(fetchUserCount, 10000);
    
    // Simuler des statistiques en temps réel
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        followers: prev.followers + Math.floor(Math.random() * 5) + 1,
        likes: prev.likes + Math.floor(Math.random() * 20) + 5,
        views: prev.views + Math.floor(Math.random() * 100) + 10,
        engagement: Math.floor(Math.random() * 10) + 85 // Entre 85% et 95%
      }));
    }, 3000);

    return () => {
      console.log('🧹 Nettoyage des intervalles LiveStats');
      clearInterval(userCountInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // Effet pour animer le compteur d'utilisateurs
  useEffect(() => {
    if (userCount !== null) {
      // Animation du compteur vers la valeur réelle
      const targetCount = userCount;
      const startCount = displayCount;
      const duration = 2000; // 2 secondes
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fonction d'easing pour une animation fluide
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

  // Effet pour simuler une croissance continue
  useEffect(() => {
    const growthInterval = setInterval(() => {
      if (userCount !== null) {
        // Simuler une croissance aléatoire de 1 à 3 utilisateurs
        const growth = Math.floor(Math.random() * 3) + 1;
        setDisplayCount(prev => prev + growth);
      }
    }, 15000); // Toutes les 15 secondes

    return () => clearInterval(growthInterval);
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
        <div className="flex items-center justify-center mb-2">
          <Users className="w-6 h-6 text-pink-400 mr-2" />
          <span className="text-2xl font-bold text-white">
            {displayCount > 0 ? formatNumber(displayCount) : (userCount ? formatNumber(userCount) : '...')}
          </span>
        </div>
        <p className="text-sm text-gray-300">
          {displayCount > 0 ? getUserStatusText(displayCount) : (userCount ? getUserStatusText(userCount) : 'Utilisateurs actifs')}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
        <div className="flex items-center justify-center mb-2">
          <TrendingUp className="w-6 h-6 text-purple-400 mr-2" />
          <span className="text-2xl font-bold text-white">
            {formatNumber(stats.followers)}
          </span>
        </div>
        <p className="text-sm text-gray-300">Followers gagnés</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
        <div className="flex items-center justify-center mb-2">
          <Heart className="w-6 h-6 text-red-400 mr-2" />
          <span className="text-2xl font-bold text-white">
            {formatNumber(stats.likes)}
          </span>
        </div>
        <p className="text-sm text-gray-300">Likes reçus</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
        <div className="flex items-center justify-center mb-2">
          <Eye className="w-6 h-6 text-blue-400 mr-2" />
          <span className="text-2xl font-bold text-white">
            {formatNumber(stats.views)}
          </span>
        </div>
        <p className="text-sm text-gray-300">Vues générées</p>
      </div>
    </div>
  );
} 