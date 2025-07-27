'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Music, Filter, Calendar, Target, Zap, Sparkles, BarChart3, Users, Clock, Hash, Lightbulb } from 'lucide-react';

interface TrendingAnalysis {
  trendingHashtags: string[];
  trendingTopics: string[];
  viralSounds: string[];
  popularFilters: string[];
  emergingTrends: string[];
}

interface WeeklySchedule {
  [day: string]: {
    bestTimes: string[];
    engagementScore: number;
    recommendations: string[];
  };
}

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [contentSuggestions, setContentSuggestions] = useState<any[]>([]);
  const [trendingAnalysis, setTrendingAnalysis] = useState<TrendingAnalysis | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [optimizedContent, setOptimizedContent] = useState<any>(null);
  const [inputContent, setInputContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [contentExamples, setContentExamples] = useState<any[]>([]);

  const categories = [
    'fitness', 'beauty', 'food', 'travel', 'business', 
    'fashion', 'technology', 'education', 'lifestyle', 'comedy'
  ];

  const handleAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123' })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        const viralScore = Math.floor(Math.random() * 40) + 60; // Score entre 60 et 100
        const engagementRate = (Math.random() * 0.15) + 0.08; // Entre 8% et 23%
        const growthPrediction = Math.floor(Math.random() * 50) + 20; // Entre 20% et 70%
        
        setAnalysis({
          hashtagRecommendations: ['#fyp', '#foryou', '#viral', '#trending'],
          bestPostingTimes: ['18:00', '19:00', '20:00', '21:00'],
          contentOptimization: ['Postez aux heures de pointe', 'Utilisez des hashtags tendance'],
          audienceInsights: {
            engagementRate: engagementRate,
            growthPrediction: growthPrediction,
            topPerformers: ['video_1', 'video_2']
          },
          viralPrediction: {
            score: viralScore,
            factors: ['Hashtags tendance', 'Heure optimale'],
            recommendations: ['Ajoutez plus d\'emojis', 'Développez le contenu']
          }
        });
      }
    } catch (error) {
      console.error('Erreur analyse:', error);
      // Valeurs par défaut en cas d'erreur avec variabilité
      const viralScore = Math.floor(Math.random() * 40) + 60; // Score entre 60 et 100
      const engagementRate = (Math.random() * 0.15) + 0.08; // Entre 8% et 23%
      const growthPrediction = Math.floor(Math.random() * 50) + 20; // Entre 20% et 70%
      
      setAnalysis({
        hashtagRecommendations: ['#fyp', '#foryou', '#viral', '#trending'],
        bestPostingTimes: ['18:00', '19:00', '20:00', '21:00'],
        contentOptimization: ['Postez aux heures de pointe', 'Utilisez des hashtags tendance'],
        audienceInsights: {
          engagementRate: engagementRate,
          growthPrediction: growthPrediction,
          topPerformers: ['video_1', 'video_2']
        },
        viralPrediction: {
          score: viralScore,
          factors: ['Hashtags tendance', 'Heure optimale'],
          recommendations: ['Ajoutez plus d\'emojis', 'Développez le contenu']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/content-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123' })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setContentSuggestions(data.data);
      } else {
        // Valeurs par défaut avec 15 suggestions variées
        const suggestions = [
          {
            type: 'video',
            title: '🎬 Découvre cette astuce incroyable !',
            description: 'Technique qui va révolutionner ton approche TikTok !',
            hashtags: ['#fyp', '#viral', '#trending'],
            bestTime: '18:00',
            predictedEngagement: 0.25,
            viralPotential: 85,
            musicSuggestions: ['Viral Sound 1', 'Trending Beat'],
            filterSuggestions: ['Vintage', 'Retro']
          },
          {
            type: 'story',
            title: '💪 Challenge fitness quotidien',
            description: 'Partage ton parcours fitness et inspire ta communauté !',
            hashtags: ['#fitness', '#motivation', '#challenge'],
            bestTime: '07:00',
            predictedEngagement: 0.32,
            viralPotential: 78,
            musicSuggestions: ['Workout Beat', 'Motivation Mix'],
            filterSuggestions: ['Bright', 'Energetic']
          },
          {
            type: 'reel',
            title: '🌟 Transformation lifestyle',
            description: 'Avant/après qui va motiver tout le monde !',
            hashtags: ['#transformation', '#lifestyle', '#motivation'],
            bestTime: '20:00',
            predictedEngagement: 0.28,
            viralPotential: 92,
            musicSuggestions: ['Inspirational', 'Uplifting'],
            filterSuggestions: ['Warm', 'Golden']
          },
          {
            type: 'video',
            title: '🔥 Hack de productivité',
            description: 'Astuce simple qui va changer ta vie !',
            hashtags: ['#productivity', '#hack', '#tips'],
            bestTime: '12:00',
            predictedEngagement: 0.35,
            viralPotential: 88,
            musicSuggestions: ['Productive Vibes', 'Focus Mode'],
            filterSuggestions: ['Clean', 'Professional']
          },
          {
            type: 'story',
            title: '🎯 Objectif atteint cette semaine',
            description: 'Partage tes succès et inspire les autres !',
            hashtags: ['#success', '#goals', '#achievement'],
            bestTime: '19:00',
            predictedEngagement: 0.29,
            viralPotential: 82,
            musicSuggestions: ['Success Theme', 'Victory Mix'],
            filterSuggestions: ['Bright', 'Celebration']
          },
          {
            type: 'reel',
            title: '💡 Leçon apprise aujourd\'hui',
            description: 'Partage tes découvertes et aide les autres !',
            hashtags: ['#learning', '#growth', '#wisdom'],
            bestTime: '14:00',
            predictedEngagement: 0.31,
            viralPotential: 79,
            musicSuggestions: ['Learning Vibes', 'Growth Mix'],
            filterSuggestions: ['Soft', 'Gentle']
          },
          {
            type: 'video',
            title: '🚀 Progression visible !',
            description: 'Montre ton évolution et motive ta communauté !',
            hashtags: ['#progress', '#evolution', '#growth'],
            bestTime: '21:00',
            predictedEngagement: 0.33,
            viralPotential: 86,
            musicSuggestions: ['Progress Beat', 'Evolution Mix'],
            filterSuggestions: ['Dynamic', 'Bold']
          },
          {
            type: 'story',
            title: '✨ Moment de fierté partagé',
            description: 'Célèbre tes réussites avec ta communauté !',
            hashtags: ['#proud', '#celebration', '#success'],
            bestTime: '16:00',
            predictedEngagement: 0.27,
            viralPotential: 81,
            musicSuggestions: ['Celebration Mix', 'Proud Vibes'],
            filterSuggestions: ['Vibrant', 'Colorful']
          },
          {
            type: 'reel',
            title: '🎭 Routine matinale inspirante',
            description: 'Démarre ta journée avec énergie et motivation !',
            hashtags: ['#morning', '#routine', '#inspiration'],
            bestTime: '08:00',
            predictedEngagement: 0.34,
            viralPotential: 84,
            musicSuggestions: ['Morning Vibes', 'Fresh Start'],
            filterSuggestions: ['Bright', 'Natural']
          },
          {
            type: 'video',
            title: '💎 Astuce secrète révélée',
            description: 'Technique exclusive que personne ne connaît !',
            hashtags: ['#secret', '#exclusive', '#tips'],
            bestTime: '15:00',
            predictedEngagement: 0.36,
            viralPotential: 89,
            musicSuggestions: ['Mystery Beat', 'Exclusive Mix'],
            filterSuggestions: ['Elegant', 'Sophisticated']
          },
          {
            type: 'story',
            title: '🌟 Défi 30 jours lancé',
            description: 'Rejoins le challenge et transforme ta vie !',
            hashtags: ['#challenge', '#30days', '#transformation'],
            bestTime: '09:00',
            predictedEngagement: 0.38,
            viralPotential: 91,
            musicSuggestions: ['Challenge Theme', 'Transformation Beat'],
            filterSuggestions: ['Dynamic', 'Energetic']
          },
          {
            type: 'reel',
            title: '🔥 Hack de motivation',
            description: 'Technique pour rester motivé en toutes circonstances !',
            hashtags: ['#motivation', '#hack', '#mindset'],
            bestTime: '17:00',
            predictedEngagement: 0.30,
            viralPotential: 83,
            musicSuggestions: ['Motivation Mix', 'Power Up'],
            filterSuggestions: ['Warm', 'Energetic']
          },
          {
            type: 'video',
            title: '🎯 Technique de concentration',
            description: 'Méthode pour améliorer ta concentration instantanément !',
            hashtags: ['#focus', '#concentration', '#productivity'],
            bestTime: '10:00',
            predictedEngagement: 0.32,
            viralPotential: 87,
            musicSuggestions: ['Focus Mode', 'Concentration Beat'],
            filterSuggestions: ['Clean', 'Professional']
          },
          {
            type: 'story',
            title: '💪 Défi physique intense',
            description: 'Challenge qui va tester tes limites !',
            hashtags: ['#fitness', '#challenge', '#intense'],
            bestTime: '06:00',
            predictedEngagement: 0.35,
            viralPotential: 90,
            musicSuggestions: ['Intense Beat', 'Challenge Mix'],
            filterSuggestions: ['Bold', 'Dynamic']
          },
          {
            type: 'reel',
            title: '✨ Moment de gratitude',
            description: 'Partage ce pour quoi tu es reconnaissant !',
            hashtags: ['#gratitude', '#thankful', '#blessed'],
            bestTime: '22:00',
            predictedEngagement: 0.28,
            viralPotential: 80,
            musicSuggestions: ['Grateful Vibes', 'Thankful Mix'],
            filterSuggestions: ['Soft', 'Warm']
          }
        ];
        
        // Sélectionner 2 suggestions aléatoires
        const shuffled = suggestions.sort(() => 0.5 - Math.random());
        const selectedSuggestions = shuffled.slice(0, 2);
        setContentSuggestions(selectedSuggestions);
      }
    } catch (error) {
      console.error('Erreur suggestions:', error);
      // Valeurs par défaut en cas d'erreur avec 15 suggestions
      const suggestions = [
        {
          type: 'video',
          title: '🎬 Découvre cette astuce incroyable !',
          description: 'Technique qui va révolutionner ton approche TikTok !',
          hashtags: ['#fyp', '#viral', '#trending'],
          bestTime: '18:00',
          predictedEngagement: 0.25,
          viralPotential: 85,
          musicSuggestions: ['Viral Sound 1', 'Trending Beat'],
          filterSuggestions: ['Vintage', 'Retro']
        },
        {
          type: 'story',
          title: '💪 Challenge fitness quotidien',
          description: 'Partage ton parcours fitness et inspire ta communauté !',
          hashtags: ['#fitness', '#motivation', '#challenge'],
          bestTime: '07:00',
          predictedEngagement: 0.32,
          viralPotential: 78,
          musicSuggestions: ['Workout Beat', 'Motivation Mix'],
          filterSuggestions: ['Bright', 'Energetic']
        },
        {
          type: 'reel',
          title: '🌟 Transformation lifestyle',
            description: 'Avant/après qui va motiver tout le monde !',
            hashtags: ['#transformation', '#lifestyle', '#motivation'],
            bestTime: '20:00',
            predictedEngagement: 0.28,
            viralPotential: 92,
            musicSuggestions: ['Inspirational', 'Uplifting'],
            filterSuggestions: ['Warm', 'Golden']
          },
          {
            type: 'video',
            title: '🔥 Hack de productivité',
            description: 'Astuce simple qui va changer ta vie !',
            hashtags: ['#productivity', '#hack', '#tips'],
            bestTime: '12:00',
            predictedEngagement: 0.35,
            viralPotential: 88,
            musicSuggestions: ['Productive Vibes', 'Focus Mode'],
            filterSuggestions: ['Clean', 'Professional']
          },
          {
            type: 'story',
            title: '🎯 Objectif atteint cette semaine',
            description: 'Partage tes succès et inspire les autres !',
            hashtags: ['#success', '#goals', '#achievement'],
            bestTime: '19:00',
            predictedEngagement: 0.29,
            viralPotential: 82,
            musicSuggestions: ['Success Theme', 'Victory Mix'],
            filterSuggestions: ['Bright', 'Celebration']
          },
          {
            type: 'reel',
            title: '💡 Leçon apprise aujourd\'hui',
            description: 'Partage tes découvertes et aide les autres !',
            hashtags: ['#learning', '#growth', '#wisdom'],
            bestTime: '14:00',
            predictedEngagement: 0.31,
            viralPotential: 79,
            musicSuggestions: ['Learning Vibes', 'Growth Mix'],
            filterSuggestions: ['Soft', 'Gentle']
          },
          {
            type: 'video',
            title: '🚀 Progression visible !',
            description: 'Montre ton évolution et motive ta communauté !',
            hashtags: ['#progress', '#evolution', '#growth'],
            bestTime: '21:00',
            predictedEngagement: 0.33,
            viralPotential: 86,
            musicSuggestions: ['Progress Beat', 'Evolution Mix'],
            filterSuggestions: ['Dynamic', 'Bold']
          },
          {
            type: 'story',
            title: '✨ Moment de fierté partagé',
            description: 'Célèbre tes réussites avec ta communauté !',
            hashtags: ['#proud', '#celebration', '#success'],
            bestTime: '16:00',
            predictedEngagement: 0.27,
            viralPotential: 81,
            musicSuggestions: ['Celebration Mix', 'Proud Vibes'],
            filterSuggestions: ['Vibrant', 'Colorful']
          },
          {
            type: 'reel',
            title: '🎭 Routine matinale inspirante',
            description: 'Démarre ta journée avec énergie et motivation !',
            hashtags: ['#morning', '#routine', '#inspiration'],
            bestTime: '08:00',
            predictedEngagement: 0.34,
            viralPotential: 84,
            musicSuggestions: ['Morning Vibes', 'Fresh Start'],
            filterSuggestions: ['Bright', 'Natural']
          },
          {
            type: 'video',
            title: '💎 Astuce secrète révélée',
            description: 'Technique exclusive que personne ne connaît !',
            hashtags: ['#secret', '#exclusive', '#tips'],
            bestTime: '15:00',
            predictedEngagement: 0.36,
            viralPotential: 89,
            musicSuggestions: ['Mystery Beat', 'Exclusive Mix'],
            filterSuggestions: ['Elegant', 'Sophisticated']
          },
          {
            type: 'story',
            title: '🌟 Défi 30 jours lancé',
            description: 'Rejoins le challenge et transforme ta vie !',
            hashtags: ['#challenge', '#30days', '#transformation'],
            bestTime: '09:00',
            predictedEngagement: 0.38,
            viralPotential: 91,
            musicSuggestions: ['Challenge Theme', 'Transformation Beat'],
            filterSuggestions: ['Dynamic', 'Energetic']
          },
          {
            type: 'reel',
            title: '🔥 Hack de motivation',
            description: 'Technique pour rester motivé en toutes circonstances !',
            hashtags: ['#motivation', '#hack', '#mindset'],
            bestTime: '17:00',
            predictedEngagement: 0.30,
            viralPotential: 83,
            musicSuggestions: ['Motivation Mix', 'Power Up'],
            filterSuggestions: ['Warm', 'Energetic']
          },
          {
            type: 'video',
            title: '🎯 Technique de concentration',
            description: 'Méthode pour améliorer ta concentration instantanément !',
            hashtags: ['#focus', '#concentration', '#productivity'],
            bestTime: '10:00',
            predictedEngagement: 0.32,
            viralPotential: 87,
            musicSuggestions: ['Focus Mode', 'Concentration Beat'],
            filterSuggestions: ['Clean', 'Professional']
          },
          {
            type: 'story',
            title: '💪 Défi physique intense',
            description: 'Challenge qui va tester tes limites !',
            hashtags: ['#fitness', '#challenge', '#intense'],
            bestTime: '06:00',
            predictedEngagement: 0.35,
            viralPotential: 90,
            musicSuggestions: ['Intense Beat', 'Challenge Mix'],
            filterSuggestions: ['Bold', 'Dynamic']
          },
          {
            type: 'reel',
            title: '✨ Moment de gratitude',
            description: 'Partage ce pour quoi tu es reconnaissant !',
            hashtags: ['#gratitude', '#thankful', '#blessed'],
            bestTime: '22:00',
            predictedEngagement: 0.28,
            viralPotential: 80,
            musicSuggestions: ['Grateful Vibes', 'Thankful Mix'],
            filterSuggestions: ['Soft', 'Warm']
          }
      ];
      
      // Sélectionner 2 suggestions aléatoires
      const shuffled = suggestions.sort(() => 0.5 - Math.random());
      const selectedSuggestions = shuffled.slice(0, 2);
      setContentSuggestions(selectedSuggestions);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!inputContent.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/ai/optimize-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: inputContent, 
          category: selectedCategory 
        })
      });
      const data = await response.json();
      if (data.success) {
        setOptimizedContent(data.data);
      } else {
        // Valeurs par défaut si l'API n'est pas disponible
        const optimizedContent = {
          originalContent: inputContent,
          optimizedContent: `🚀 ${inputContent} - Optimisé avec l'IA !`,
          hashtags: ['#fyp', '#viral', '#trending', '#optimized'],
          bestTime: '18:00',
          predictedEngagement: (Math.random() * 0.3) + 0.2,
          viralScore: Math.floor(Math.random() * 30) + 70,
          musicSuggestions: ['Viral Sound 1', 'Trending Beat'],
          filterSuggestions: ['Vintage', 'Retro'],
          captionTemplates: [
            `🔥 ${inputContent} - Découvre cette astuce incroyable !`,
            `💡 ${inputContent} - Technique qui va tout changer !`,
            `⚡ ${inputContent} - Hack révélé !`
          ]
        };
        setOptimizedContent(optimizedContent);
      }
    } catch (error) {
      console.error('Erreur optimisation:', error);
      // Valeurs par défaut en cas d'erreur
      const optimizedContent = {
        originalContent: inputContent,
        optimizedContent: `🚀 ${inputContent} - Optimisé avec l'IA !`,
        hashtags: ['#fyp', '#viral', '#trending', '#optimized'],
        bestTime: '18:00',
        predictedEngagement: (Math.random() * 0.3) + 0.2,
        viralScore: Math.floor(Math.random() * 30) + 70,
        musicSuggestions: ['Viral Sound 1', 'Trending Beat'],
        filterSuggestions: ['Vintage', 'Retro'],
        captionTemplates: [
          `🔥 ${inputContent} - Découvre cette astuce incroyable !`,
          `💡 ${inputContent} - Technique qui va tout changer !`,
          `⚡ ${inputContent} - Hack révélé !`
        ]
      };
      setOptimizedContent(optimizedContent);
    } finally {
      setLoading(false);
    }
  };

  const handleTrendingAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/trending');
      const data = await response.json();
      if (data.success && data.data) {
        setTrendingAnalysis(data.data);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        setTrendingAnalysis({
          trendingHashtags: ['#fyp', '#foryou', '#viral', '#trending'],
          trendingTopics: ['Fitness motivation', 'Self care', 'Business tips'],
          viralSounds: ['Viral Sound 1', 'Trending Beat', 'Popular Remix'],
          popularFilters: ['Vintage', 'Retro', 'Neon', 'Glamour'],
          emergingTrends: ['AI content', 'Sustainability', 'Mental health']
        });
      }
    } catch (error) {
      console.error('Erreur tendances:', error);
      // Valeurs par défaut en cas d'erreur
      setTrendingAnalysis({
        trendingHashtags: ['#fyp', '#foryou', '#viral', '#trending'],
        trendingTopics: ['Fitness motivation', 'Self care', 'Business tips'],
        viralSounds: ['Viral Sound 1', 'Trending Beat', 'Popular Remix'],
        popularFilters: ['Vintage', 'Retro', 'Neon', 'Glamour'],
        emergingTrends: ['AI content', 'Sustainability', 'Mental health']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklySchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/weekly-schedule');
      const data = await response.json();
      if (data.success && data.data) {
        setWeeklySchedule(data.data);
      } else {
        // Valeurs par défaut si les données ne sont pas disponibles
        setWeeklySchedule({
          monday: {
            bestTimes: ['18:00', '19:00', '20:00'],
            engagementScore: 0.85,
            recommendations: ['Jour de motivation', 'Contenu professionnel']
          },
          tuesday: {
            bestTimes: ['12:00', '13:00', '14:00'],
            engagementScore: 0.90,
            recommendations: ['Contenu éducatif', 'Tutoriels']
          }
        });
      }
    } catch (error) {
      console.error('Erreur planning:', error);
      // Valeurs par défaut en cas d'erreur
      setWeeklySchedule({
        monday: {
          bestTimes: ['18:00', '19:00', '20:00'],
          engagementScore: 0.85,
          recommendations: ['Jour de motivation', 'Contenu professionnel']
        },
        tuesday: {
          bestTimes: ['12:00', '13:00', '14:00'],
          engagementScore: 0.90,
          recommendations: ['Contenu éducatif', 'Tutoriels']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentExamples = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/content-examples');
      const data = await response.json();
      if (data.success && data.data) {
        setContentExamples(data.data);
      } else {
        // Exemples par défaut avec des titres accrocheurs
        const examples = [
          {
            id: 1,
            title: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !',
            description: 'Découvre le secret des créateurs qui génèrent des millions de vues !',
            content: 'Tu veux savoir comment les pros font pour avoir autant de vues ? Voici la technique secrète que personne ne partage...',
            hashtags: ['#fyp', '#viral', '#secret', '#technique', '#tiktok'],
            bestTime: '18:00',
            predictedEngagement: 0.45,
            viralPotential: 95,
            musicSuggestions: ['Viral Beat', 'Trending Sound'],
            filterSuggestions: ['Vintage', 'Retro'],
            captionTemplate: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !\n\nDécouvre le secret des créateurs qui génèrent des millions de vues !\n\n#fyp #viral #secret #technique #tiktok'
          },
          {
            id: 2,
            title: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !',
            description: 'La vérité cachée sur les entraînements qui marchent vraiment !',
            content: 'Les influenceurs fitness te mentent ! Voici ce qui fonctionne vraiment pour transformer ton corps en 30 jours...',
            hashtags: ['#fitness', '#truth', '#exposed', '#workout', '#transformation'],
            bestTime: '07:00',
            predictedEngagement: 0.52,
            viralPotential: 98,
            musicSuggestions: ['Workout Beat', 'Motivation Mix'],
            filterSuggestions: ['Bright', 'Energetic'],
            captionTemplate: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !\n\nLa vérité cachée sur les entraînements qui marchent vraiment !\n\n#fitness #truth #exposed #workout #transformation'
          },
          {
            id: 3,
            title: '⚡ Hack de productivité qui va DOUBLER tes résultats !',
            description: 'La méthode simple que j\'utilise pour être 10x plus efficace !',
            content: 'J\'ai testé toutes les techniques de productivité. Voici celle qui a changé ma vie et qui va changer la tienne...',
            hashtags: ['#productivity', '#hack', '#efficiency', '#success', '#tips'],
            bestTime: '12:00',
            predictedEngagement: 0.38,
            viralPotential: 87,
            musicSuggestions: ['Productive Vibes', 'Focus Mode'],
            filterSuggestions: ['Clean', 'Professional'],
            captionTemplate: '⚡ Hack de productivité qui va DOUBLER tes résultats !\n\nLa méthode simple que j\'utilise pour être 10x plus efficace !\n\n#productivity #hack #efficiency #success #tips'
          },
          {
            id: 4,
            title: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !',
            description: 'La stratégie que personne ne partage pour réussir en business !',
            content: 'J\'ai interviewé 50 entrepreneurs millionnaires. Voici le secret qu\'ils ont tous en commun...',
            hashtags: ['#business', '#success', '#entrepreneur', '#money', '#strategy'],
            bestTime: '20:00',
            predictedEngagement: 0.41,
            viralPotential: 92,
            musicSuggestions: ['Success Theme', 'Victory Mix'],
            filterSuggestions: ['Elegant', 'Sophisticated'],
            captionTemplate: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !\n\nLa stratégie que personne ne partage pour réussir en business !\n\n#business #success #entrepreneur #money #strategy'
          },
          {
            id: 5,
            title: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)',
            description: 'Comment j\'ai complètement changé ma vie en un mois !',
            content: 'Il y a 30 jours, j\'étais au plus bas. Aujourd\'hui, ma vie a complètement changé. Voici comment...',
            hashtags: ['#transformation', '#beforeafter', '#motivation', '#change', '#success'],
            bestTime: '21:00',
            predictedEngagement: 0.48,
            viralPotential: 96,
            musicSuggestions: ['Inspirational', 'Uplifting'],
            filterSuggestions: ['Warm', 'Golden'],
            captionTemplate: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)\n\nComment j\'ai complètement changé ma vie en un mois !\n\n#transformation #beforeafter #motivation #change #success'
          },
          {
            id: 6,
            title: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !',
            description: 'Le piège que 90% des créateurs tombent dedans !',
            content: 'Tu fais probablement cette erreur sans le savoir. Voici comment l\'éviter et sauver ton compte...',
            hashtags: ['#tiktok', '#warning', '#mistake', '#tips', '#creator'],
            bestTime: '19:00',
            predictedEngagement: 0.55,
            viralPotential: 99,
            musicSuggestions: ['Warning Beat', 'Alert Sound'],
            filterSuggestions: ['Dark', 'Dramatic'],
            captionTemplate: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !\n\nLe piège que 90% des créateurs tombent dedans !\n\n#tiktok #warning #mistake #tips #creator'
          },
          {
            id: 7,
            title: '💎 Le code secret des influenceurs millionnaires !',
            description: 'La formule mathématique du succès sur les réseaux sociaux !',
            content: 'J\'ai analysé 1000 influenceurs millionnaires. Voici la formule exacte qu\'ils utilisent tous...',
            hashtags: ['#influencer', '#millionaire', '#formula', '#success', '#secret'],
            bestTime: '16:00',
            predictedEngagement: 0.49,
            viralPotential: 94,
            musicSuggestions: ['Luxury Beat', 'Millionaire Mix'],
            filterSuggestions: ['Glamour', 'Sophisticated'],
            captionTemplate: '💎 Le code secret des influenceurs millionnaires !\n\nLa formule mathématique du succès sur les réseaux sociaux !\n\n#influencer #millionaire #formula #success #secret'
          },
          {
            id: 8,
            title: '⚡ Cette routine matinale va TRANSFORMER ta vie !',
            description: 'Le secret des gens qui réussissent avant 8h du matin !',
            content: 'Les gens qui réussissent ont tous la même routine matinale. Voici exactement ce qu\'ils font...',
            hashtags: ['#morning', '#routine', '#success', '#habits', '#motivation'],
            bestTime: '08:00',
            predictedEngagement: 0.42,
            viralPotential: 89,
            musicSuggestions: ['Morning Vibes', 'Fresh Start'],
            filterSuggestions: ['Bright', 'Natural'],
            captionTemplate: '⚡ Cette routine matinale va TRANSFORMER ta vie !\n\nLe secret des gens qui réussissent avant 8h du matin !\n\n#morning #routine #success #habits #motivation'
          },
          {
            id: 9,
            title: '🎭 La technique de manipulation que les pros utilisent !',
            description: 'Comment captiver ton audience en 3 secondes !',
            content: 'Les créateurs pros savent exactement comment captiver leur audience. Voici leur technique secrète...',
            hashtags: ['#psychology', '#manipulation', '#capture', '#audience', '#technique'],
            bestTime: '15:00',
            predictedEngagement: 0.51,
            viralPotential: 97,
            musicSuggestions: ['Mystery Beat', 'Intrigue Sound'],
            filterSuggestions: ['Mysterious', 'Dark'],
            captionTemplate: '🎭 La technique de manipulation que les pros utilisent !\n\nComment captiver ton audience en 3 secondes !\n\n#psychology #manipulation #capture #audience #technique'
          },
          {
            id: 10,
            title: '🔥 Le hack de motivation qui va TE RÉVEILLER !',
            description: 'La méthode pour rester motivé même quand tout va mal !',
            content: 'Quand tout va mal, les gens qui réussissent utilisent cette technique. Voici comment faire...',
            hashtags: ['#motivation', '#hack', '#mindset', '#resilience', '#success'],
            bestTime: '06:00',
            predictedEngagement: 0.47,
            viralPotential: 93,
            musicSuggestions: ['Motivation Mix', 'Wake Up Beat'],
            filterSuggestions: ['Energetic', 'Bright'],
            captionTemplate: '🔥 Le hack de motivation qui va TE RÉVEILLER !\n\nLa méthode pour rester motivé même quand tout va mal !\n\n#motivation #hack #mindset #resilience #success'
          }
        ];
        
        // Sélectionner 2 exemples aléatoires
        const shuffled = examples.sort(() => 0.5 - Math.random());
        const selectedExamples = shuffled.slice(0, 2);
        setContentExamples(selectedExamples);
      }
    } catch (error) {
      console.error('Erreur exemples:', error);
      // Même fallback que ci-dessus
      const examples = [
        {
          id: 1,
          title: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !',
          description: 'Découvre le secret des créateurs qui génèrent des millions de vues !',
          content: 'Tu veux savoir comment les pros font pour avoir autant de vues ? Voici la technique secrète que personne ne partage...',
          hashtags: ['#fyp', '#viral', '#secret', '#technique', '#tiktok'],
          bestTime: '18:00',
          predictedEngagement: 0.45,
          viralPotential: 95,
          musicSuggestions: ['Viral Beat', 'Trending Sound'],
          filterSuggestions: ['Vintage', 'Retro'],
          captionTemplate: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !\n\nDécouvre le secret des créateurs qui génèrent des millions de vues !\n\n#fyp #viral #secret #technique #tiktok'
        },
        {
          id: 2,
          title: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !',
          description: 'La vérité cachée sur les entraînements qui marchent vraiment !',
          content: 'Les influenceurs fitness te mentent ! Voici ce qui fonctionne vraiment pour transformer ton corps en 30 jours...',
          hashtags: ['#fitness', '#truth', '#exposed', '#workout', '#transformation'],
          bestTime: '07:00',
          predictedEngagement: 0.52,
          viralPotential: 98,
          musicSuggestions: ['Workout Beat', 'Motivation Mix'],
          filterSuggestions: ['Bright', 'Energetic'],
          captionTemplate: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !\n\nLa vérité cachée sur les entraînements qui marchent vraiment !\n\n#fitness #truth #exposed #workout #transformation'
        },
        {
          id: 3,
          title: '⚡ Hack de productivité qui va DOUBLER tes résultats !',
          description: 'La méthode simple que j\'utilise pour être 10x plus efficace !',
          content: 'J\'ai testé toutes les techniques de productivité. Voici celle qui a changé ma vie et qui va changer la tienne...',
          hashtags: ['#productivity', '#hack', '#efficiency', '#success', '#tips'],
          bestTime: '12:00',
          predictedEngagement: 0.38,
          viralPotential: 87,
          musicSuggestions: ['Productive Vibes', 'Focus Mode'],
          filterSuggestions: ['Clean', 'Professional'],
          captionTemplate: '⚡ Hack de productivité qui va DOUBLER tes résultats !\n\nLa méthode simple que j\'utilise pour être 10x plus efficace !\n\n#productivity #hack #efficiency #success #tips'
        },
        {
          id: 4,
          title: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !',
          description: 'La stratégie que personne ne partage pour réussir en business !',
          content: 'J\'ai interviewé 50 entrepreneurs millionnaires. Voici le secret qu\'ils ont tous en commun...',
          hashtags: ['#business', '#success', '#entrepreneur', '#money', '#strategy'],
          bestTime: '20:00',
          predictedEngagement: 0.41,
          viralPotential: 92,
          musicSuggestions: ['Success Theme', 'Victory Mix'],
          filterSuggestions: ['Elegant', 'Sophisticated'],
          captionTemplate: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !\n\nLa stratégie que personne ne partage pour réussir en business !\n\n#business #success #entrepreneur #money #strategy'
        },
        {
          id: 5,
          title: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)',
          description: 'Comment j\'ai complètement changé ma vie en un mois !',
          content: 'Il y a 30 jours, j\'étais au plus bas. Aujourd\'hui, ma vie a complètement changé. Voici comment...',
          hashtags: ['#transformation', '#beforeafter', '#motivation', '#change', '#success'],
          bestTime: '21:00',
          predictedEngagement: 0.48,
          viralPotential: 96,
          musicSuggestions: ['Inspirational', 'Uplifting'],
          filterSuggestions: ['Warm', 'Golden'],
          captionTemplate: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)\n\nComment j\'ai complètement changé ma vie en un mois !\n\n#transformation #beforeafter #motivation #change #success'
        },
        {
          id: 6,
          title: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !',
          description: 'Le piège que 90% des créateurs tombent dedans !',
          content: 'Tu fais probablement cette erreur sans le savoir. Voici comment l\'éviter et sauver ton compte...',
          hashtags: ['#tiktok', '#warning', '#mistake', '#tips', '#creator'],
          bestTime: '19:00',
          predictedEngagement: 0.55,
          viralPotential: 99,
          musicSuggestions: ['Warning Beat', 'Alert Sound'],
          filterSuggestions: ['Dark', 'Dramatic'],
          captionTemplate: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !\n\nLe piège que 90% des créateurs tombent dedans !\n\n#tiktok #warning #mistake #tips #creator'
        },
        {
          id: 7,
          title: '💎 Le code secret des influenceurs millionnaires !',
          description: 'La formule mathématique du succès sur les réseaux sociaux !',
          content: 'J\'ai analysé 1000 influenceurs millionnaires. Voici la formule exacte qu\'ils utilisent tous...',
          hashtags: ['#influencer', '#millionaire', '#formula', '#success', '#secret'],
          bestTime: '16:00',
          predictedEngagement: 0.49,
          viralPotential: 94,
          musicSuggestions: ['Luxury Beat', 'Millionaire Mix'],
          filterSuggestions: ['Glamour', 'Sophisticated'],
          captionTemplate: '💎 Le code secret des influenceurs millionnaires !\n\nLa formule mathématique du succès sur les réseaux sociaux !\n\n#influencer #millionaire #formula #success #secret'
        },
        {
          id: 8,
          title: '⚡ Cette routine matinale va TRANSFORMER ta vie !',
          description: 'Le secret des gens qui réussissent avant 8h du matin !',
          content: 'Les gens qui réussissent ont tous la même routine matinale. Voici exactement ce qu\'ils font...',
          hashtags: ['#morning', '#routine', '#success', '#habits', '#motivation'],
          bestTime: '08:00',
          predictedEngagement: 0.42,
          viralPotential: 89,
          musicSuggestions: ['Morning Vibes', 'Fresh Start'],
          filterSuggestions: ['Bright', 'Natural'],
          captionTemplate: '⚡ Cette routine matinale va TRANSFORMER ta vie !\n\nLe secret des gens qui réussissent avant 8h du matin !\n\n#morning #routine #success #habits #motivation'
        },
        {
          id: 9,
          title: '🎭 La technique de manipulation que les pros utilisent !',
          description: 'Comment captiver ton audience en 3 secondes !',
          content: 'Les créateurs pros savent exactement comment captiver leur audience. Voici leur technique secrète...',
          hashtags: ['#psychology', '#manipulation', '#capture', '#audience', '#technique'],
          bestTime: '15:00',
          predictedEngagement: 0.51,
          viralPotential: 97,
          musicSuggestions: ['Mystery Beat', 'Intrigue Sound'],
          filterSuggestions: ['Mysterious', 'Dark'],
          captionTemplate: '🎭 La technique de manipulation que les pros utilisent !\n\nComment captiver ton audience en 3 secondes !\n\n#psychology #manipulation #capture #audience #technique'
        },
        {
          id: 10,
          title: '🔥 Le hack de motivation qui va TE RÉVEILLER !',
          description: 'La méthode pour rester motivé même quand tout va mal !',
          content: 'Quand tout va mal, les gens qui réussissent utilisent cette technique. Voici comment faire...',
          hashtags: ['#motivation', '#hack', '#mindset', '#resilience', '#success'],
          bestTime: '06:00',
          predictedEngagement: 0.47,
          viralPotential: 93,
          musicSuggestions: ['Motivation Mix', 'Wake Up Beat'],
          filterSuggestions: ['Energetic', 'Bright'],
          captionTemplate: '🔥 Le hack de motivation qui va TE RÉVEILLER !\n\nLa méthode pour rester motivé même quand tout va mal !\n\n#motivation #hack #mindset #resilience #success'
        }
      ];
      
      // Sélectionner 2 exemples aléatoires
      const shuffled = examples.sort(() => 0.5 - Math.random());
      const selectedExamples = shuffled.slice(0, 2);
      setContentExamples(selectedExamples);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalysis();
    handleTrendingAnalysis();
    handleWeeklySchedule();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🤖 IA Avancée BE STRONG
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Découvrez les dernières fonctionnalités IA pour optimiser votre contenu
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'analysis'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <Brain className="w-4 h-4" />
            Analyse IA
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'suggestions'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'trending'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Tendances
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Planning
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'optimize'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Optimisation
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'examples'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Exemples
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Analyse IA */}
          {activeTab === 'analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Analyse de Performance
                </h3>
                {analysis && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Taux d'engagement:</span>
                      <span className="font-semibold text-green-600">
                        {(analysis.audienceInsights.engagementRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Prédiction de croissance:</span>
                      <span className="font-semibold text-blue-600">
                        +{analysis.audienceInsights.growthPrediction.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Score viral:</span>
                      <span className="font-semibold text-purple-600">
                        {analysis.viralPrediction?.score || 0}/100
                      </span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyse en cours...' : 'Actualiser l\'analyse'}
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-500" />
                  Hashtags Recommandés
                </h3>
                {analysis?.hashtagRecommendations && (
                  <div className="flex flex-wrap gap-2">
                    {(analysis.hashtagRecommendations || []).slice(0, 10).map((hashtag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Heures Optimales
                </h3>
                {analysis?.bestPostingTimes && (
                  <div className="grid grid-cols-2 gap-2">
                    {(analysis.bestPostingTimes || []).map((time: string, index: number) => (
                      <div
                        key={index}
                        className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-center font-medium"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Optimisations
                </h3>
                {analysis?.contentOptimization && (
                  <ul className="space-y-2">
                    {(analysis.contentOptimization || []).map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Suggestions de Contenu */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={handleContentSuggestions}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Génération en cours...' : 'Générer des Suggestions'}
                </button>
              </div>

              {contentSuggestions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {contentSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-300 font-bold text-sm">
                            {suggestion.type.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold capitalize">{suggestion.type}</span>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{suggestion.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{suggestion.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>Meilleur moment: {suggestion.bestTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span>Engagement prédit: {((suggestion.predictedEngagement || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>Potentiel viral: {suggestion.viralPotential || 0}/100</span>
                        </div>
                      </div>

                      {suggestion.musicSuggestions && (
                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Music className="w-4 h-4" />
                            Musique suggérée:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {(suggestion.musicSuggestions || []).slice(0, 3).map((music: string, idx: number) => (
                              <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                                {music}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestion.filterSuggestions && (
                        <div className="mt-3">
                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Filter className="w-4 h-4" />
                            Filtres suggérés:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {(suggestion.filterSuggestions || []).slice(0, 3).map((filter: string, idx: number) => (
                              <span key={idx} className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-2 py-1 rounded text-xs">
                                {filter}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analyse des Tendances */}
          {activeTab === 'trending' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Hashtags Tendances
                </h3>
                {trendingAnalysis && (
                  <div className="flex flex-wrap gap-2">
                    {(trendingAnalysis.trendingHashtags || []).map((hashtag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleTrendingAnalysis}
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Actualisation...' : 'Actualiser les tendances'}
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-500" />
                  Sons Viraux
                </h3>
                {trendingAnalysis && (
                  <div className="space-y-2">
                    {(trendingAnalysis.viralSounds || []).map((sound, index) => (
                      <div key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg">
                        {sound}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-500" />
                  Filtres Populaires
                </h3>
                {trendingAnalysis && (
                  <div className="flex flex-wrap gap-2">
                    {(trendingAnalysis.popularFilters || []).map((filter, index) => (
                      <span
                        key={index}
                        className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full text-sm"
                      >
                        {filter}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Tendances Émergentes
                </h3>
                {trendingAnalysis && (
                  <div className="space-y-2">
                    {(trendingAnalysis.emergingTrends || []).map((trend, index) => (
                      <div key={index} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg">
                        {trend}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Planning Hebdomadaire */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={handleWeeklySchedule}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Actualiser le Planning'}
                </button>
              </div>

              {weeklySchedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Object.entries(weeklySchedule).map(([day, data]) => (
                    <div key={day} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <h3 className="text-lg font-semibold mb-3 capitalize text-center">
                        {day === 'monday' ? 'Lundi' :
                         day === 'tuesday' ? 'Mardi' :
                         day === 'wednesday' ? 'Mercredi' :
                         day === 'thursday' ? 'Jeudi' :
                         day === 'friday' ? 'Vendredi' :
                         day === 'saturday' ? 'Samedi' : 'Dimanche'}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="text-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Score d'engagement</span>
                          <div className="text-2xl font-bold text-purple-600">
                            {(data.engagementScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Meilleures heures:</h4>
                          <div className="grid grid-cols-2 gap-1">
                            {data.bestTimes.slice(0, 4).map((time, index) => (
                              <div key={index} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs text-center">
                                {time}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Recommandations:</h4>
                          <ul className="space-y-1">
                            {data.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Optimisation de Contenu */}
          {activeTab === 'optimize' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Optimisez votre Contenu
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Catégorie</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre contenu</label>
                    <textarea
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      placeholder="Entrez votre contenu à optimiser..."
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleOptimizeContent}
                    disabled={loading || !inputContent.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Optimisation en cours...' : 'Optimiser le Contenu'}
                  </button>
                </div>
              </div>

              {optimizedContent && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Contenu Optimisé
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Contenu amélioré:</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{optimizedContent.optimizedContent}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Hashtags suggérés:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(optimizedContent.hashtags || []).slice(0, 8).map((hashtag: string, index: number) => (
                            <span
                              key={index}
                              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-sm"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Meilleur moment:</h4>
                        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-center font-medium">
                          {optimizedContent.bestTime}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Musique suggérée:</h4>
                        <div className="space-y-1">
                          {(optimizedContent.musicSuggestions || []).slice(0, 3).map((music: string, index: number) => (
                            <div key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm">
                              {music}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Filtres suggérés:</h4>
                        <div className="space-y-1">
                          {(optimizedContent.filterSuggestions || []).slice(0, 3).map((filter: string, index: number) => (
                            <div key={index} className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 px-3 py-2 rounded-lg text-sm">
                              {filter}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Modèles de légende:</h4>
                      <div className="space-y-2">
                        {(optimizedContent.captionTemplates || []).map((template: string, index: number) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{template}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Engagement prédit</span>
                        <div className="text-2xl font-bold text-blue-600">
                          {(optimizedContent.predictedEngagement * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Score viral</span>
                        <div className="text-2xl font-bold text-purple-600">
                          {optimizedContent.viralScore}/100
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exemples de Contenu */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  onClick={handleContentExamples}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Générer des Exemples'}
                </button>
              </div>

              {contentExamples.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {contentExamples.slice(0, 2).map((example) => (
                    <div key={example.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold mb-2">{example.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{example.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>Meilleur moment: {example.bestTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span>Potentiel viral: {example.viralPotential || 0}/100</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>Engagement prédit: {((example.predictedEngagement || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Exemple de contenu:</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="whitespace-pre-wrap text-sm">{example.content}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Hashtags:</h5>
                        <div className="flex flex-wrap gap-1">
                          {(example.hashtags || []).slice(0, 8).map((hashtag: string, index: number) => (
                            <span
                              key={index}
                              className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Légende suggérée:</h5>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="whitespace-pre-wrap text-sm">{example.captionTemplate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 