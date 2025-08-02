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

    // Récupérer les statistiques de l'utilisateur
    const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/users/stats?userId=${userId}`);
    const statsData = await statsResponse.json();

    if (!statsResponse.ok) {
      return NextResponse.json({ error: 'Erreur récupération statistiques' }, { status: 500 });
    }

    const stats = statsData.stats;

    // Calculer les badges mérités
    const earnedBadges = [];
    const allBadges = [];

    for (const [key, badge] of Object.entries(BADGES)) {
      const isEarned = badge.condition(stats);
      const badgeInfo = {
        ...badge,
        earned: isEarned,
        earnedAt: isEarned ? new Date().toISOString() : null
      };

      allBadges.push(badgeInfo);
      if (isEarned) {
        earnedBadges.push(badgeInfo);
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