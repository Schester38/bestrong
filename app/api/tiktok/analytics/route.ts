import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simulation des données TikTok
    const mockTikTokData = {
      followers: 15420,
      following: 892,
      likes: 234567,
      views: 1890456,
      videos: 47,
      engagement_rate: 8.7,
      avg_views_per_video: 40222,
      best_posting_time: "19:00-21:00",
      top_hashtags: ["#fyp", "#viral", "#trending", "#foryou", "#tiktok"],
      content_performance: [
        {
          video_id: "1",
          views: 125000,
          likes: 8900,
          comments: 456,
          shares: 234,
          hashtags: ["#fyp", "#viral", "#trending"],
          duration: 45,
          posted_at: "2024-01-15T19:30:00Z"
        },
        {
          video_id: "2",
          views: 89000,
          likes: 6700,
          comments: 345,
          shares: 189,
          hashtags: ["#foryou", "#trending"],
          duration: 32,
          posted_at: "2024-01-14T20:15:00Z"
        }
      ],
      ai_recommendations: [
        {
          id: '1',
          type: 'timing',
          title: 'Optimiser les horaires de publication',
          description: 'Vos vidéos performantes sont publiées entre 19:00-21:00. Publiez plus régulièrement à ces heures pour maximiser l\'engagement.',
          impact: 'high',
          priority: 1,
          action: 'Planifier 3 publications par semaine entre 19h-21h',
          estimated_growth: '+25% de vues'
        },
        {
          id: '2',
          type: 'hashtag',
          title: 'Diversifier les hashtags',
          description: 'Vous utilisez principalement des hashtags génériques. Ajoutez des hashtags spécifiques à votre niche pour atteindre un public plus ciblé.',
          impact: 'high',
          priority: 2,
          action: 'Utiliser 70% hashtags spécifiques + 30% hashtags populaires',
          estimated_growth: '+40% de nouveaux abonnés'
        },
        {
          id: '3',
          type: 'content',
          title: 'Optimiser la durée des vidéos',
          description: 'Vos vidéos de 45 secondes performent mieux. Créez plus de contenu dans cette durée optimale.',
          impact: 'medium',
          priority: 3,
          action: 'Créer 80% de vidéos entre 30-60 secondes',
          estimated_growth: '+15% de rétention'
        },
        {
          id: '4',
          type: 'engagement',
          title: 'Améliorer l\'engagement',
          description: 'Votre taux d\'engagement de 8.7% peut être optimisé. Interagissez plus avec votre communauté.',
          impact: 'medium',
          priority: 4,
          action: 'Répondre à tous les commentaires dans les 2h',
          estimated_growth: '+20% d\'engagement'
        },
        {
          id: '5',
          type: 'trending',
          title: 'Surfer sur les tendances',
          description: 'Identifiez et utilisez les tendances émergentes dans votre niche pour augmenter la visibilité.',
          impact: 'high',
          priority: 5,
          action: 'Créer 1 vidéo tendance par semaine',
          estimated_growth: '+50% de vues potentielles'
        }
      ]
    };

    return NextResponse.json(mockTikTokData);
  } catch (error) {
    console.error('Erreur lors de l\'analyse TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse TikTok' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Simulation des actions TikTok
    switch (action) {
      case 'connect':
        return NextResponse.json({ 
          success: true, 
          message: 'Compte TikTok connecté avec succès',
          connected: true
        });

      case 'analyze':
        return NextResponse.json({ 
          success: true, 
          message: 'Analyse en cours...',
          analysis_id: 'tiktok_analysis_' + Date.now()
        });

      case 'recommendations':
        return NextResponse.json({ 
          success: true, 
          message: 'Recommandations générées',
          recommendations_count: 5
        });

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur lors de l\'action TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action TikTok' },
      { status: 500 }
    );
  }
} 