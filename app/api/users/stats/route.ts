import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans stats:', {
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

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 });
    }

    // Récupérer les statistiques de base de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les activités de l'utilisateur
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Erreur récupération activités:', activitiesError);
    }

    // Récupérer les défis complétés
    const { data: completedChallenges, error: challengesError } = await supabase
      .from('user_completions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (challengesError) {
      console.error('Erreur récupération défis complétés:', challengesError);
    }

    // Calculer les statistiques
    const stats = {
      // Statistiques de base
      user: {
        id: user.id,
        phone: user.phone,
        pseudo: user.pseudo,
        credits: user.credits || 0,
        experience: user.experience || 0,
        dateInscription: user.createdAt,
        derniereActivite: user.updatedAt
      },

      // Statistiques d'activité
      activite: {
        totalActivites: activities?.length || 0,
        activitesCetteSemaine: activities?.filter(a => {
          const date = new Date(a.created_at);
          const semaine = new Date();
          semaine.setDate(semaine.getDate() - 7);
          return date >= semaine;
        }).length || 0,
        activitesCeMois: activities?.filter(a => {
          const date = new Date(a.created_at);
          const mois = new Date();
          mois.setMonth(mois.getMonth() - 1);
          return date >= mois;
        }).length || 0,
        derniereActivite: activities?.[0]?.created_at || null
      },

      // Statistiques des défis
      defis: {
        totalCompletes: completedChallenges?.length || 0,
        defisCetteSemaine: completedChallenges?.filter(c => {
          const date = new Date(c.completed_at);
          const semaine = new Date();
          semaine.setDate(semaine.getDate() - 7);
          return date >= semaine;
        }).length || 0,
        defisCeMois: completedChallenges?.filter(c => {
          const date = new Date(c.completed_at);
          const mois = new Date();
          mois.setMonth(mois.getMonth() - 1);
          return date >= mois;
        }).length || 0,
        tauxCompletion: activities?.length ? 
          Math.round((completedChallenges?.length || 0) / activities.length * 100) : 0
      },

      // Statistiques de progression
      progression: {
        niveau: Math.floor((user.experience || 0) / 1000) + 1,
        experienceActuelle: (user.experience || 0) % 1000,
        experienceProchainNiveau: 1000 - ((user.experience || 0) % 1000),
        pourcentageNiveau: Math.round(((user.experience || 0) % 1000) / 10)
      },

      // Statistiques de récompenses
      recompenses: {
        totalCreditsGagnes: activities?.reduce((sum, a) => sum + (a.credits || 0), 0) || 0,
        totalExperienceGagnee: activities?.reduce((sum, a) => sum + (a.experience || 0), 0) || 0,
        creditsCetteSemaine: activities?.filter(a => {
          const date = new Date(a.created_at);
          const semaine = new Date();
          semaine.setDate(semaine.getDate() - 7);
          return date >= semaine;
        }).reduce((sum, a) => sum + (a.credits || 0), 0) || 0,
        experienceCetteSemaine: activities?.filter(a => {
          const date = new Date(a.created_at);
          const semaine = new Date();
          semaine.setDate(semaine.getDate() - 7);
          return date >= semaine;
        }).reduce((sum, a) => sum + (a.experience || 0), 0) || 0
      },

      // Statistiques de performance
      performance: {
        streakActuel: calculateStreak(activities || []),
        meilleurStreak: calculateBestStreak(activities || []),
        joursActifs: calculateActiveDays(activities || []),
        moyenneActivitesParJour: activities?.length ? 
          Math.round((activities.length / calculateActiveDays(activities)) * 10) / 10 : 0
      }
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Erreur API statistiques:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction pour calculer le streak actuel
function calculateStreak(activities: any[]): number {
  if (!activities.length) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const hasActivity = activities.some(activity => {
      const activityDate = new Date(activity.created_at);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === currentDate.getTime();
    });
    
    if (hasActivity) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Fonction pour calculer le meilleur streak
function calculateBestStreak(activities: any[]): number {
  if (!activities.length) return 0;
  
  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  // Trier les activités par date
  const sortedActivities = activities.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.created_at);
    activityDate.setHours(0, 0, 0, 0);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.floor((activityDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    lastDate = activityDate;
  }
  
  return Math.max(bestStreak, currentStreak);
}

// Fonction pour calculer le nombre de jours actifs
function calculateActiveDays(activities: any[]): number {
  if (!activities.length) return 0;
  
  const uniqueDays = new Set();
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.getTime());
  });
  
  return uniqueDays.size;
} 