import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans badges:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// Définition des badges disponibles
const BADGES = {
  // Badges de niveau
  NOVICE: {
    id: 'novice',
    name: 'Novice',
    description: 'Premier pas dans l\'aventure',
    icon: '🌟',
    condition: (stats: any) => stats.progression.niveau >= 1,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  APPRENTI: {
    id: 'apprenti',
    name: 'Apprenti',
    description: 'Début de l\'apprentissage',
    icon: '📚',
    condition: (stats: any) => stats.progression.niveau >= 3,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    description: 'Maîtrise des compétences',
    icon: '🎯',
    condition: (stats: any) => stats.progression.niveau >= 5,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  MAITRE: {
    id: 'maitre',
    name: 'Maître',
    description: 'Niveau de maîtrise avancé',
    icon: '👑',
    condition: (stats: any) => stats.progression.niveau >= 10,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  LEGENDE: {
    id: 'legende',
    name: 'Légende',
    description: 'Statut légendaire atteint',
    icon: '🔥',
    condition: (stats: any) => stats.progression.niveau >= 20,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },

  // Badges de streak
  STREAK_3: {
    id: 'streak_3',
    name: 'Persévérant',
    description: '3 jours consécutifs d\'activité',
    icon: '🔥',
    condition: (stats: any) => stats.performance.streakActuel >= 3,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Déterminé',
    description: '7 jours consécutifs d\'activité',
    icon: '⚡',
    condition: (stats: any) => stats.performance.streakActuel >= 7,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Inflexible',
    description: '30 jours consécutifs d\'activité',
    icon: '💎',
    condition: (stats: any) => stats.performance.streakActuel >= 30,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
  },

  // Badges de défis
  CHALLENGE_MASTER: {
    id: 'challenge_master',
    name: 'Maître des Défis',
    description: '10 défis complétés',
    icon: '🏆',
    condition: (stats: any) => stats.defis.totalCompletes >= 10,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  CHALLENGE_LEGEND: {
    id: 'challenge_legend',
    name: 'Légende des Défis',
    description: '50 défis complétés',
    icon: '👑',
    condition: (stats: any) => stats.defis.totalCompletes >= 50,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },

  // Badges d'activité
  ACTIVE_USER: {
    id: 'active_user',
    name: 'Utilisateur Actif',
    description: '10 activités réalisées',
    icon: '📈',
    condition: (stats: any) => stats.activite.totalActivites >= 10,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  SUPER_ACTIVE: {
    id: 'super_active',
    name: 'Super Actif',
    description: '50 activités réalisées',
    icon: '🚀',
    condition: (stats: any) => stats.activite.totalActivites >= 50,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },

  // Badges de récompenses
  CREDIT_COLLECTOR: {
    id: 'credit_collector',
    name: 'Collecteur de Crédits',
    description: '1000 crédits gagnés',
    icon: '💰',
    condition: (stats: any) => stats.recompenses.totalCreditsGagnes >= 1000,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  XP_MASTER: {
    id: 'xp_master',
    name: 'Maître de l\'Expérience',
    description: '5000 XP gagnés',
    icon: '⭐',
    condition: (stats: any) => stats.recompenses.totalExperienceGagnee >= 5000,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },

  // Badges spéciaux
  FIRST_WEEK: {
    id: 'first_week',
    name: 'Première Semaine',
    description: 'Première semaine d\'activité complétée',
    icon: '🎉',
    condition: (stats: any) => stats.activite.activitesCetteSemaine >= 5,
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  },
  CONSISTENT: {
    id: 'consistent',
    name: 'Constant',
    description: 'Activité régulière sur 7 jours',
    icon: '📅',
    condition: (stats: any) => stats.performance.joursActifs >= 7,
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
  }
};

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
      // Retourner des badges de démonstration si l'utilisateur n'existe pas
      const demoBadges = Object.values(BADGES).map(badge => ({
        ...badge,
        earned: false,
        earnedAt: null
      }));
      
      return NextResponse.json({
        badges: {
          earned: [],
          all: demoBadges,
          totalEarned: 0,
          totalAvailable: demoBadges.length,
          score: 0,
          rank: 'Bronze'
        }
      });
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
        tauxCompletion: completedChallenges?.length ? Math.round((completedChallenges.length / (completedChallenges.length + 5)) * 100) : 0
      },

      // Progression
      progression: {
        niveau: Math.floor((user.experience || 0) / 100) + 1,
        experienceActuelle: (user.experience || 0) % 100,
        experienceProchainNiveau: 100,
        pourcentageNiveau: Math.round(((user.experience || 0) % 100))
      },

      // Récompenses
      recompenses: {
        totalCreditsGagnes: user.credits || 0,
        totalExperienceGagnee: user.experience || 0,
        creditsCetteSemaine: 0,
        experienceCetteSemaine: 0
      },

      // Performance
      performance: {
        streakActuel: calculateStreak(activities || []),
        meilleurStreak: calculateBestStreak(activities || []),
        joursActifs: calculateActiveDays(activities || []),
        moyenneActivitesParJour: activities?.length ? Math.round(activities.length / 30) : 0
      }
    };

    // Calculer les badges mérités
    const earnedBadges = [];
    const allBadges = [];

    // Récupérer les badges précédemment gagnés pour détecter les nouveaux
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    const existingBadgeIds = existingBadges?.map(b => b.badge_id) || [];

    for (const [key, badge] of Object.entries(BADGES)) {
      const isEarned = badge.condition(stats);
      const isNewBadge = isEarned && !existingBadgeIds.includes(badge.id);
      
      const badgeInfo = {
        ...badge,
        earned: isEarned,
        earnedAt: isEarned ? new Date().toISOString() : null
      };

      allBadges.push(badgeInfo);
      if (isEarned) {
        earnedBadges.push(badgeInfo);
        
        // Enregistrer le nouveau badge dans la base de données
        if (isNewBadge) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              badge_id: badge.id,
              earned_at: new Date().toISOString()
            })
            .single();
        }
      }
    }

    // Calculer le score total des badges
    const totalScore = earnedBadges.reduce((score, badge) => {
      // Score basé sur la rareté du badge
      if (badge.id.includes('legende') || badge.id.includes('30')) return score + 100;
      if (badge.id.includes('maitre') || badge.id.includes('7')) return score + 50;
      if (badge.id.includes('expert') || badge.id.includes('3')) return score + 25;
      return score + 10;
    }, 0);

    // Déterminer le rang
    let rank = 'Bronze';
    if (totalScore >= 500) rank = 'Diamant';
    else if (totalScore >= 300) rank = 'Platine';
    else if (totalScore >= 200) rank = 'Or';
    else if (totalScore >= 100) rank = 'Argent';

    return NextResponse.json({
      badges: {
        earned: earnedBadges,
        all: allBadges,
        totalEarned: earnedBadges.length,
        totalAvailable: allBadges.length,
        score: totalScore,
        rank: rank
      }
    });

  } catch (error) {
    console.error('Erreur API badges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonctions utilitaires pour calculer les statistiques
function calculateStreak(activities: any[]): number {
  if (!activities || activities.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  while (true) {
    const hasActivityOnDate = activities.some(activity => {
      const activityDate = new Date(activity.created_at);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === currentDate.getTime();
    });
    
    if (hasActivityOnDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateBestStreak(activities: any[]): number {
  if (!activities || activities.length === 0) return 0;
  
  const sortedActivities = activities.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.created_at);
    activityDate.setHours(0, 0, 0, 0);
    
    if (lastDate === null) {
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
  
  bestStreak = Math.max(bestStreak, currentStreak);
  return bestStreak;
}

function calculateActiveDays(activities: any[]): number {
  if (!activities || activities.length === 0) return 0;
  
  const uniqueDates = new Set();
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at);
    date.setHours(0, 0, 0, 0);
    uniqueDates.add(date.getTime());
  });
  
  return uniqueDates.size;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, badgeId } = await request.json();

    if (!userId || !badgeId) {
      return NextResponse.json({ error: 'User ID et Badge ID requis' }, { status: 400 });
    }

    // Vérifier si le badge existe
    const badge = Object.values(BADGES).find(b => b.id === badgeId);
    if (!badge) {
      return NextResponse.json({ error: 'Badge non trouvé' }, { status: 404 });
    }

    // Récupérer les statistiques de l'utilisateur
    const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/users/stats?userId=${userId}`);
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 });
    }

    const stats = statsData.stats;

    // Vérifier si l'utilisateur mérite le badge
    if (!badge.condition(stats)) {
      return NextResponse.json({ error: 'Conditions non remplies pour ce badge' }, { status: 400 });
    }

    // Enregistrer le badge dans la base de données (si une table badges existe)
    // Pour l'instant, on retourne juste le succès
    return NextResponse.json({
      success: true,
      badge: {
        ...badge,
        earned: true,
        earnedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur API badges POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 