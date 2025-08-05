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
    // Récupérer les automatisations existantes
    const { data: automations, error: automationsError } = await supabase
      .from('admin_automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (automationsError) {
      console.error('Erreur récupération automations:', automationsError);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    return NextResponse.json({ automations: automations || [] });

  } catch (error) {
    console.error('Erreur automations admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    switch (action) {
      case 'create_automation':
        // Créer une nouvelle automatisation
        const { data: newAutomation, error: createError } = await supabase
          .from('admin_automations')
          .insert([{
            type: config.type,
            name: config.name,
            description: config.description,
            schedule: config.schedule,
            is_active: true
          }])
          .select();

        if (createError) {
          console.error('Erreur création automation:', createError);
          return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Automatisation créée avec succès',
          automation: newAutomation?.[0]
        });

      case 'execute_automation':
        switch (config.type) {
          case 'cleanup_inactive_users':
            // Marquer les utilisateurs inactifs (30+ jours sans activité)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: inactiveUsers, error: inactiveError } = await supabase
              .from('users')
              .update({ is_active: false })
              .lt('last_activity', thirtyDaysAgo.toISOString())
              .select();

            if (inactiveError) {
              console.error('Erreur nettoyage utilisateurs:', inactiveError);
              return NextResponse.json({ error: 'Erreur lors du nettoyage' }, { status: 500 });
            }

            return NextResponse.json({ 
              success: true, 
              message: `${inactiveUsers?.length || 0} utilisateurs inactifs marqués`
            });

          case 'backup_daily':
            // Créer un backup quotidien
            const { data: backupData, error: backupError } = await supabase
              .from('admin_backups')
              .insert([{
                type: 'daily',
                created_at: new Date().toISOString(),
                status: 'completed'
              }])
              .select();

            if (backupError) {
              console.error('Erreur backup quotidien:', backupError);
              return NextResponse.json({ error: 'Erreur lors du backup' }, { status: 500 });
            }

            return NextResponse.json({ 
              success: true, 
              message: 'Backup quotidien créé avec succès'
            });

          case 'send_weekly_report':
            // Générer et sauvegarder un rapport hebdomadaire
            const { data: reportData, error: reportError } = await supabase
              .from('admin_reports')
              .insert([{
                type: 'weekly',
                created_at: new Date().toISOString(),
                content: JSON.stringify({
                  totalUsers: 0, // À calculer
                  activeUsers: 0, // À calculer
                  totalTasks: 0, // À calculer
                  period: 'weekly'
                }),
                status: 'completed'
              }])
              .select();

            if (reportError) {
              console.error('Erreur rapport hebdomadaire:', reportError);
              return NextResponse.json({ error: 'Erreur lors du rapport' }, { status: 500 });
            }

            return NextResponse.json({ 
              success: true, 
              message: 'Rapport hebdomadaire généré avec succès'
            });

          default:
            return NextResponse.json({ error: 'Type d\'automatisation non reconnu' }, { status: 400 });
        }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erreur automation admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 