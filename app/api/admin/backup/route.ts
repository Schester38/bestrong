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
    // Récupérer toutes les données importantes
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    const { data: tasks, error: tasksError } = await supabase
      .from('task_completions')
      .select('*');

    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('*');

    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*');

    if (usersError || tasksError || activitiesError || notificationsError) {
      console.error('Erreur récupération données backup:', { 
        usersError, tasksError, activitiesError, notificationsError 
      });
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    // Créer le backup avec timestamp
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users: users || [],
        taskCompletions: tasks || [],
        activities: activities || [],
        notifications: notifications || []
      },
      summary: {
        totalUsers: users?.length || 0,
        totalTasks: tasks?.length || 0,
        totalActivities: activities?.length || 0,
        totalNotifications: notifications?.length || 0
      }
    };

    return NextResponse.json(backup);

  } catch (error) {
    console.error('Erreur backup admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'restore' && data) {
      // Restauration des données (à implémenter avec précaution)
      console.log('Restauration demandée:', data);
      
      // Vérifier la structure des données
      if (!data.users || !Array.isArray(data.users)) {
        return NextResponse.json({ error: 'Format de données invalide' }, { status: 400 });
      }

      // Restaurer les utilisateurs
      const { error: restoreError } = await supabase
        .from('users')
        .upsert(data.users, { onConflict: 'id' });

      if (restoreError) {
        console.error('Erreur restauration:', restoreError);
        return NextResponse.json({ error: 'Erreur lors de la restauration' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Restauration effectuée avec succès',
        restoredUsers: data.users.length
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });

  } catch (error) {
    console.error('Erreur restauration admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 