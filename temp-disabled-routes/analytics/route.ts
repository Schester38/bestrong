import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

export async function GET(req: NextRequest) {
  try {
    // Vérifier la connexion à Supabase
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Configuration Supabase manquante',
        details: 'Vérifiez les variables d\'environnement'
      }, { status: 500 });
    }

    // 1. Statistiques générales
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    const { data: tasks, error: tasksError } = await supabase
      .from('task_completions')
      .select('*');

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('*');

    if (usersError || tasksError || activitiesError) {
      console.error('Erreur récupération données:', { usersError, tasksError, activitiesError });
      return NextResponse.json({ 
        error: 'Erreur base de données',
        details: { usersError, tasksError, activitiesError }
      }, { status: 500 });
    }

    // 2. Calculs des statistiques
    const totalUsers = users?.length || 0;
    const totalTasks = tasks?.length || 0;
    const totalActivities = activities?.length || 0;

    // Utilisateurs actifs (connexion dans les 7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = activities?.filter(activity => 
      new Date(activity.created_at) >= sevenDaysAgo
    ).length || 0;

    // Nouveaux utilisateurs ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = users?.filter(user => 
      new Date(user.created_at) >= startOfMonth
    ).length || 0;

    // Tâches complétées ce mois
    const tasksThisMonth = tasks?.filter(task => 
      new Date(task.created_at) >= startOfMonth
    ).length || 0;

    // Crédits totaux distribués
    const totalCredits = users?.reduce((sum, user) => sum + (user.credits || 0), 0) || 0;

    // 3. Tendances (comparaison avec le mois précédent)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    lastMonth.setHours(0, 0, 0, 0);
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const newUsersLastMonth = users?.filter(user => {
      const userDate = new Date(user.created_at);
      return userDate >= lastMonth && userDate <= endOfLastMonth;
    }).length || 0;

    const tasksLastMonth = tasks?.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate >= lastMonth && taskDate <= endOfLastMonth;
    }).length || 0;

    // Calcul des pourcentages de changement
    const userGrowth = newUsersLastMonth > 0 
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : 0;

    const taskGrowth = tasksLastMonth > 0
      ? Math.round(((tasksThisMonth - tasksLastMonth) / tasksLastMonth) * 100)
      : 0;

    // 4. Top utilisateurs
    const topUsers = users
      ?.sort((a, b) => (b.credits || 0) - (a.credits || 0))
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        phone: user.phone,
        pseudo: user.pseudo,
        credits: user.credits || 0,
        createdAt: user.created_at
      })) || [];

    // 5. Activité par jour (7 derniers jours)
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayActivities = activities?.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= date && activityDate < nextDate;
      }).length || 0;

      dailyActivity.push({
        date: date.toISOString().split('T')[0],
        count: dayActivities
      });
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        totalTasks,
        totalCredits,
        newUsersThisMonth,
        tasksThisMonth
      },
      trends: {
        userGrowth,
        taskGrowth
      },
      topUsers,
      dailyActivity
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Erreur analytics admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 