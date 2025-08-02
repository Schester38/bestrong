import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans challenges:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Défis par défaut
    const defaultChallenges = [
      {
        id: '1',
        title: '🎯 Créateur du jour',
        description: 'Publiez 3 contenus de qualité',
        type: 'task_created',
        difficulty: 'medium',
        category: 'content',
        reward_credits: 50,
        reward_experience: 100,
        target_value: 3,
        isCompleted: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        title: '📈 Stratège social',
        description: 'Gagnez 500 nouveaux followers',
        type: 'task_created',
        difficulty: 'hard',
        category: 'growth',
        reward_credits: 200,
        reward_experience: 500,
        target_value: 500,
        isCompleted: false,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        title: '❤️ Engagement Master',
        description: 'Obtenez 1000 likes sur un contenu',
        type: 'task_created',
        difficulty: 'expert',
        category: 'engagement',
        reward_credits: 500,
        reward_experience: 1000,
        target_value: 1000,
        isCompleted: false,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        title: '🔥 Viral Hunter',
        description: 'Créez un contenu qui dépasse 10k vues',
        type: 'task_created',
        difficulty: 'expert',
        category: 'viral',
        reward_credits: 1000,
        reward_experience: 2000,
        target_value: 10000,
        isCompleted: false,
        created_at: new Date().toISOString()
      }
    ];

    // Si pas d'userId, retourner les défis par défaut
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ challenges: defaultChallenges });
    }

    // Essayer de récupérer les défis depuis la table activities
    try {
      const { data: challenges, error } = await supabase
        .from('activities')
        .select('*')
        .eq('type', 'task_created')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération défis:', error);
        // Retourner les défis par défaut en cas d'erreur
        return NextResponse.json({ challenges: defaultChallenges });
      }

      // Si pas de défis en base, retourner les défis par défaut
      if (!challenges || challenges.length === 0) {
        return NextResponse.json({ challenges: defaultChallenges });
      }

      // Essayer de récupérer les complétions utilisateur
      let userCompletions: Array<{activity_id: string, completed_at: string}> = [];
      try {
        const { data: completions, error: completionsError } = await supabase
          .from('user_completions')
          .select('activity_id, completed_at')
          .eq('user_id', userId);

        if (!completionsError && completions) {
          userCompletions = completions;
        }
      } catch (completionError) {
        console.log('Pas de table user_completions, utilisation des défis sans statut');
      }

      // Marquer les défis comme complétés
      const challengesWithStatus = challenges.map(challenge => ({
        ...challenge,
        title: challenge.description || 'Défi sans titre',
        isCompleted: userCompletions.some(completion => 
          completion.activity_id === challenge.id
        ) || false,
        completedAt: userCompletions.find(completion => 
          completion.activity_id === challenge.id
        )?.completed_at
      }));

      return NextResponse.json({ challenges: challengesWithStatus });
    } catch (dbError) {
      console.log('Erreur base de données, utilisation des défis par défaut');
      return NextResponse.json({ challenges: defaultChallenges });
    }

  } catch (error) {
    console.error('Erreur API défis:', error);
    // En cas d'erreur, retourner les défis par défaut
    const fallbackChallenges = [
      {
        id: 'fallback-1',
        title: '🎯 Défi de Fallback',
        description: 'Défi par défaut en cas d\'erreur',
        type: 'task_created',
        difficulty: 'easy',
        category: 'general',
        reward_credits: 10,
        reward_experience: 20,
        target_value: 1,
        isCompleted: false,
        created_at: new Date().toISOString()
      }
    ];
    return NextResponse.json({ challenges: fallbackChallenges });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId } = await request.json();

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'User ID et Challenge ID requis' }, { status: 400 });
    }

    // Marquer le défi comme complété
    const { data, error } = await supabase
      .from('user_completions')
      .insert({
        user_id: userId,
        activity_id: challengeId,
        completed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur complétion défi:', error);
      return NextResponse.json({ error: 'Erreur complétion défi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erreur API complétion défi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 