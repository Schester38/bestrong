"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, Heart } from 'lucide-react';

interface LiveStatsProps {
  userCount: number | null;
}

export default function LiveStats({ userCount }: LiveStatsProps) {
  const [stats, setStats] = useState({
    followers: 0,
    likes: 0,
    views: 0,
    engagement: 0
  });

  useEffect(() => {
    // Simuler des statistiques en temps réel
    const interval = setInterval(() => {
      setStats(prev => ({
        followers: prev.followers + Math.floor(Math.random() * 5) + 1,
        likes: prev.likes + Math.floor(Math.random() * 20) + 5,
        views: prev.views + Math.floor(Math.random() * 100) + 10,
        engagement: Math.floor(Math.random() * 10) + 85 // Entre 85% et 95%
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
            {userCount ? formatNumber(userCount) : '...'}
          </span>
        </div>
        <p className="text-sm text-gray-300">Utilisateurs actifs</p>
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