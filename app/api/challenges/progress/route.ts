import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NotificationService } from '@/app/utils/notification-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// POST: Mettre à jour la progression d'un défi
export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, progress, action } = await request.json();

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'User ID et Challenge ID requis' }, { status: 400 });
    }

    // Récupérer le défi pour connaître l'objectif
    const { data: challenge, error: challengeError } = await supabase
      .from('activities')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Défi non trouvé' }, { status: 404 });
    }

    // Vérifier si l'utilisateur a déjà une progression pour ce défi
    const { data: existingProgress, error: progressError } = await supabase
      .from('user_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_id', challengeId)
      .single();

    // Si l'utilisateur a déjà complété ce défi, ne pas le faire à nouveau
    if (existingProgress && existingProgress.completed_at) {
      return NextResponse.json({ 
        success: true, 
        message: 'Défi déjà complété',
        alreadyCompleted: true 
      });
    }

    // Calculer si le défi est complété
    const targetValue = challenge.target_value || 1;
    const isCompleted = progress >= targetValue;

    if (isCompleted) {
      // Marquer le défi comme complété
      const { data: completionData, error: completionError } = await supabase
        .from('user_completions')
        .upsert({
          user_id: userId,
          activity_id: challengeId,
          completed_at: new Date().toISOString(),
          progress: progress
        })
        .select()
        .single();

      if (completionError) {
        console.error('Erreur marquage complétion:', completionError);
        return NextResponse.json({ error: 'Erreur marquage complétion' }, { status: 500 });
      }

      // Ajouter les récompenses à l'utilisateur (si système de crédits existe)
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('credits, experience')
          .eq('id', userId)
          .single();

        if (!userError && user) {
          const newCredits = (user.credits || 0) + (challenge.reward_credits || 0);
          const newExperience = (user.experience || 0) + (challenge.reward_experience || 0);

          await supabase
            .from('users')
            .update({ 
              credits: newCredits, 
              experience: newExperience 
            })
            .eq('id', userId);

          // Créer une notification de défi complété
          const rewardText = challenge.reward_credits || challenge.reward_experience 
            ? `${challenge.reward_credits || 0} crédits et ${challenge.reward_experience || 0} XP`
            : undefined;
          
          await NotificationService.createChallengeNotification(
            userId, 
            challenge.title || 'Défi', 
            rewardText
          );
        }
      } catch (rewardError) {
        console.log('Système de récompenses non disponible:', rewardError);
      }

      return NextResponse.json({ 
        success: true,
        message: `🎉 Défi complété ! Vous avez gagné ${challenge.reward_credits || 0} crédits et ${challenge.reward_experience || 0} XP !`,
        completed: true,
        rewards: {
          credits: challenge.reward_credits || 0,
          experience: challenge.reward_experience || 0
        }
      });
    } else {
      // Mettre à jour la progression sans compléter
      const { data: progressData, error: progressUpdateError } = await supabase
        .from('user_completions')
        .upsert({
          user_id: userId,
          activity_id: challengeId,
          progress: progress,
          completed_at: null
        })
        .select()
        .single();

      if (progressUpdateError) {
        console.error('Erreur mise à jour progression:', progressUpdateError);
        return NextResponse.json({ error: 'Erreur mise à jour progression' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        message: `Progression mise à jour: ${progress}/${targetValue}`,
        completed: false,
        progress: progress,
        target: targetValue
      });
    }

  } catch (error) {
    console.error('Erreur API progression défi:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET: Récupérer la progression d'un utilisateur pour tous les défis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 });
    }

    // Récupérer tous les défis
    const { data: challenges, error: challengesError } = await supabase
      .from('activities')
      .select('*')
      .eq('type', 'task_created')
      .order('created_at', { ascending: false });

    if (challengesError) {
      return NextResponse.json({ error: 'Erreur récupération défis' }, { status: 500 });
    }

    // Récupérer les progressions de l'utilisateur
    const { data: userProgress, error: progressError } = await supabase
      .from('user_completions')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.log('Pas de progression trouvée, utilisation de valeurs par défaut');
    }

    // Combiner les défis avec les progressions
    const challengesWithProgress = challenges?.map(challenge => {
      const userProgressForChallenge = userProgress?.find(p => p.activity_id === challenge.id);
      return {
        ...challenge,
        progress: userProgressForChallenge?.progress || 0,
        isCompleted: !!userProgressForChallenge?.completed_at,
        completedAt: userProgressForChallenge?.completed_at
      };
    }) || [];

    return NextResponse.json({ 
      challenges: challengesWithProgress 
    });

  } catch (error) {
    console.error('Erreur API récupération progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 