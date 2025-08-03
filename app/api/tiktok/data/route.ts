import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const accountType = request.headers.get('X-Account-Type') || 'personal';

    // Récupérer les informations utilisateur
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Erreur lors de la récupération des données utilisateur');
    }

    const userData = await userResponse.json();

    // Récupérer les statistiques utilisateur
    const statsResponse = await fetch('https://open.tiktokapis.com/v2/user/info/stats/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let statsData: any = {};
    if (statsResponse.ok) {
      statsData = await statsResponse.json();
    }

    // Récupérer la liste des vidéos
    const videosResponse = await fetch('https://open.tiktokapis.com/v2/video/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let videosData: any[] = [];
    if (videosResponse.ok) {
      const videosResponseData = await videosResponse.json();
      videosData = videosResponseData.data?.videos || [];
    }

    // Traiter et analyser les données
    const processedStats = {
      followers: userData.data?.user?.follower_count || 0,
      following: userData.data?.user?.following_count || 0,
      likes: userData.data?.user?.likes_count || 0,
      views: statsData.data?.total_play_count || 0,
      videos: videosData.length,
      engagement_rate: calculateEngagementRate(userData.data?.user, statsData.data),
      avg_views_per_video: calculateAvgViews(videosData),
      best_posting_time: analyzeBestPostingTime(videosData),
      top_hashtags: extractTopHashtags(videosData),
      account_type: accountType as 'personal' | 'business',
      content_performance: processVideosPerformance(videosData)
    };

    // Générer des recommandations IA basées sur les vraies données
    const recommendations = generateAIRecommendations(processedStats, accountType);

    return NextResponse.json({
      stats: processedStats,
      recommendations: recommendations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires pour l'analyse des données
function calculateEngagementRate(user: any, stats: any): number {
  if (!user || !stats) return 0;
  
  const totalEngagement = (user.likes_count || 0) + (stats.total_comment_count || 0) + (stats.total_share_count || 0);
  const totalViews = stats.total_play_count || 1;
  
  return Math.round((totalEngagement / totalViews) * 100 * 100) / 100; // 2 décimales
}

function calculateAvgViews(videos: any[]): number {
  if (!videos.length) return 0;
  
  const totalViews = videos.reduce((sum, video) => sum + (video.stats?.play_count || 0), 0);
  return Math.round(totalViews / videos.length);
}

function analyzeBestPostingTime(videos: any[]): string {
  // Analyse des heures de publication pour trouver les meilleurs moments
  const postingHours = videos.map(video => {
    const date = new Date(video.create_time * 1000);
    return date.getHours();
  });

  const hourCounts = postingHours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const bestHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([hour]) => parseInt(hour))
    .sort((a, b) => a - b);

  if (bestHours.length >= 2) {
    return `${bestHours[0].toString().padStart(2, '0')}:00-${bestHours[1].toString().padStart(2, '0')}:00`;
  }
  
  return "19:00-21:00"; // Valeur par défaut
}

function extractTopHashtags(videos: any[]): string[] {
  const hashtagCounts: Record<string, number> = {};
  
  videos.forEach(video => {
    const hashtags = video.hashtag_names || [];
    hashtags.forEach((hashtag: string) => {
      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
    });
  });

  return Object.entries(hashtagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([hashtag]) => `#${hashtag}`);
}

function processVideosPerformance(videos: any[]): any[] {
  return videos.slice(0, 5).map(video => ({
    video_id: video.id,
    views: video.stats?.play_count || 0,
    likes: video.stats?.like_count || 0,
    comments: video.stats?.comment_count || 0,
    shares: video.stats?.share_count || 0,
    hashtags: video.hashtag_names || [],
    duration: video.video?.duration || 0,
    posted_at: new Date(video.create_time * 1000).toISOString()
  }));
}

function generateAIRecommendations(stats: any, accountType: string): any[] {
  const recommendations = [];

  // Recommandation basée sur l'engagement
  if (stats.engagement_rate < 5) {
    recommendations.push({
      id: '1',
      type: 'engagement',
      title: 'Améliorer l\'engagement',
      description: `Votre taux d'engagement de ${stats.engagement_rate}% peut être optimisé. Interagissez plus avec votre communauté.`,
      impact: 'high',
      priority: 1,
      action: 'Répondre à tous les commentaires dans les 2h',
      estimated_growth: '+20% d\'engagement'
    });
  }

  // Recommandation basée sur la fréquence de publication
  if (stats.videos < 10) {
    recommendations.push({
      id: '2',
      type: 'content',
      title: 'Augmenter la fréquence de publication',
      description: 'Vous avez peu de vidéos. Publiez plus régulièrement pour maintenir l\'algorithme.',
      impact: 'high',
      priority: 2,
      action: accountType === 'business' ? 'Publier 2-3 vidéos par semaine' : 'Publier 3-4 vidéos par semaine',
      estimated_growth: '+50% de visibilité'
    });
  }

  // Recommandation basée sur les hashtags
  if (stats.top_hashtags.length < 3) {
    recommendations.push({
      id: '3',
      type: 'hashtag',
      title: 'Diversifier les hashtags',
      description: 'Utilisez plus de hashtags spécifiques à votre niche pour atteindre un public ciblé.',
      impact: 'medium',
      priority: 3,
      action: 'Utiliser 70% hashtags spécifiques + 30% hashtags populaires',
      estimated_growth: '+40% de nouveaux abonnés'
    });
  }

  // Recommandations spécifiques aux comptes Business
  if (accountType === 'business') {
    recommendations.push({
      id: '4',
      type: 'business',
      title: 'Optimiser la présence de marque',
      description: 'Utilisez les fonctionnalités business pour améliorer votre visibilité de marque.',
      impact: 'high',
      priority: 4,
      action: 'Créer des campagnes publicitaires ciblées',
      estimated_growth: '+100% de conversions'
    });

    recommendations.push({
      id: '5',
      type: 'business',
      title: 'Modération avancée',
      description: 'Activez la modération automatique des commentaires pour protéger votre marque.',
      impact: 'medium',
      priority: 5,
      action: 'Configurer les filtres de modération',
      estimated_growth: '+30% de sentiment positif'
    });
  }

  // Recommandations spécifiques aux comptes Personnels
  if (accountType === 'personal') {
    recommendations.push({
      id: '6',
      type: 'personal',
      title: 'Développer votre communauté',
      description: 'Interagissez plus avec votre audience pour construire une communauté fidèle.',
      impact: 'medium',
      priority: 4,
      action: 'Organiser des lives et Q&A',
      estimated_growth: '+60% d\'engagement'
    });
  }

  return recommendations;
} 