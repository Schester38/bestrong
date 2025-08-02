import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform'); // tiktok, instagram, youtube
    const category = searchParams.get('category'); // makeup, cooking, fitness, etc.

    // Données par défaut pour les recommandations
    const defaultRecommendations = [
      {
        id: '1',
        title: 'Tutoriel Makeup Avant/Après',
        description: 'Transformation spectaculaire avec des produits abordables',
        platform: 'tiktok',
        category: 'beauty',
        estimated_views: 50000,
        engagement_rate: 8.5,
        difficulty: 'medium',
        duration: '3-5 minutes',
        hashtags: ['#makeup', '#transformation', '#beauty', '#tutorial'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Recette Rapide 5 Minutes',
        description: 'Plat délicieux préparé en moins de 5 minutes',
        platform: 'instagram',
        category: 'cooking',
        estimated_views: 75000,
        engagement_rate: 9.2,
        difficulty: 'easy',
        duration: '5 minutes',
        hashtags: ['#recipe', '#quickmeal', '#food', '#cooking'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Conseils Fitness Débutant',
        description: 'Exercices simples pour commencer le fitness',
        platform: 'youtube',
        category: 'fitness',
        estimated_views: 120000,
        engagement_rate: 7.8,
        difficulty: 'easy',
        duration: '10-15 minutes',
        hashtags: ['#fitness', '#beginner', '#workout', '#health'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Challenge TikTok Viral',
        description: 'Participez au challenge du moment pour maximiser votre visibilité',
        platform: 'tiktok',
        category: 'trending',
        estimated_views: 200000,
        engagement_rate: 12.5,
        difficulty: 'easy',
        duration: '30 secondes',
        hashtags: ['#challenge', '#viral', '#trending', '#tiktok'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        title: 'Story Instagram Engageante',
        description: 'Créez des stories qui captent l\'attention de vos followers',
        platform: 'instagram',
        category: 'engagement',
        estimated_views: 15000,
        engagement_rate: 15.2,
        difficulty: 'medium',
        duration: '2-3 minutes',
        hashtags: ['#stories', '#engagement', '#instagram', '#content'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      }
    ];

    // Si pas d'userId, retourner directement les données par défaut
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ recommendations: defaultRecommendations });
    }

    // Essayer de récupérer les recommandations depuis la table suggestions
    try {
      let query = supabase
        .from('suggestions')
        .select('*')
        .eq('type', 'content_recommendation')
        .order('created_at', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data: recommendations, error } = await query;

      // Si pas d'erreur et qu'il y a des recommandations, les retourner
      if (!error && recommendations && recommendations.length > 0) {
        return NextResponse.json({ recommendations });
      }
    } catch (dbError) {
      console.log('Pas de données en base, utilisation des recommandations par défaut');
    }

    // Sinon, retourner les données par défaut
    return NextResponse.json({ recommendations: defaultRecommendations });

  } catch (error) {
    console.error('Erreur API recommandations:', error);
    // En cas d'erreur, retourner quand même les données par défaut
    const fallbackRecommendations = [
      {
        id: 'fallback-1',
        title: 'Contenu de Fallback',
        description: 'Recommandation par défaut en cas d\'erreur',
        platform: 'tiktok',
        category: 'general',
        estimated_views: 10000,
        engagement_rate: 5.0,
        difficulty: 'easy',
        duration: '1-2 minutes',
        hashtags: ['#fallback', '#content'],
        thumbnail_url: null,
        created_at: new Date().toISOString()
      }
    ];
    return NextResponse.json({ recommendations: fallbackRecommendations });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, recommendationId, action } = await request.json();

    if (!userId || !recommendationId) {
      return NextResponse.json({ error: 'User ID et Recommendation ID requis' }, { status: 400 });
    }

    // Enregistrer l'action de l'utilisateur (like, dislike, utilisé)
    const { data, error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        suggestion_id: recommendationId,
        action: action || 'viewed',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur enregistrement action:', error);
      return NextResponse.json({ error: 'Erreur enregistrement action' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur API action recommandation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 