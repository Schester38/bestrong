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
    // Récupérer les données de sécurité
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (activitiesError) {
      console.error('Erreur récupération activités:', activitiesError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    // Analyser les activités suspectes
    const suspiciousActivities = activities?.filter(activity => {
      // Détecter les activités suspectes (exemple: trop d'actions en peu de temps)
      return activity.type === 'login_failed' || activity.type === 'suspicious_activity';
    }) || [];

    // Tentatives de connexion échouées
    const failedLogins = activities?.filter(activity => 
      activity.type === 'login_failed'
    ) || [];

    // Utilisateurs avec accès admin
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('dashboardAccess', true);

    if (adminError) {
      console.error('Erreur récupération admins:', adminError);
    }

    const securityData = {
      suspiciousActivities: suspiciousActivities.length,
      failedLogins: failedLogins.length,
      adminUsers: adminUsers?.length || 0,
      recentActivities: activities?.slice(0, 10) || [],
      alerts: [] as Array<{type: string; message: string}>
    };

    // Ajouter des alertes si nécessaire
    if (failedLogins.length > 5) {
      securityData.alerts.push({
        type: 'warning',
        message: `${failedLogins.length} tentatives de connexion échouées détectées`
      });
    }

    if (suspiciousActivities.length > 0) {
      securityData.alerts.push({
        type: 'danger',
        message: `${suspiciousActivities.length} activités suspectes détectées`
      });
    }

    return NextResponse.json(securityData);

  } catch (error) {
    console.error('Erreur sécurité admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, reason } = body;

    switch (action) {
      case 'ban_user':
        // Bannir un utilisateur
        const { error: banError } = await supabase
          .from('users')
          .update({ 
            dashboard_access: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (banError) {
          console.error('Erreur bannissement:', banError);
          return NextResponse.json({ error: 'Erreur lors du bannissement' }, { status: 500 });
        }

        // Logger l'action
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: userId,
            type: 'admin_action',
            description: `Utilisateur banni par admin: ${reason}`,
            details: { action: 'ban', reason }
          });

        return NextResponse.json({ 
          success: true, 
          message: 'Utilisateur banni avec succès' 
        });

      case 'unban_user':
        // Débannir un utilisateur
        const { error: unbanError } = await supabase
          .from('users')
          .update({ 
            dashboard_access: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (unbanError) {
          console.error('Erreur débannissement:', unbanError);
          return NextResponse.json({ error: 'Erreur lors du débannissement' }, { status: 500 });
        }

        // Logger l'action
        await supabase
          .from('user_activity_logs')
          .insert({
            user_id: userId,
            type: 'admin_action',
            description: `Utilisateur débanni par admin`,
            details: { action: 'unban' }
          });

        return NextResponse.json({ 
          success: true, 
          message: 'Utilisateur débanni avec succès' 
        });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur action sécurité:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 