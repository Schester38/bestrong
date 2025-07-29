import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  try {
    console.log('🔄 Initialisation des tables...');
    
    // Utiliser la clé de service si disponible, sinon la clé anonyme
    const keyToUse = supabaseServiceKey || supabaseAnonKey;
    
    if (!keyToUse) {
      return NextResponse.json({ 
        error: 'Clés Supabase manquantes',
        message: 'Les variables d\'environnement Supabase ne sont pas définies'
      }, { status: 500 });
    }
    
    console.log('🔑 Utilisation de la clé:', supabaseServiceKey ? 'Service Role' : 'Anon');
    const supabase = createClient(supabaseUrl, keyToUse);
    
    // Créer la table tasks si elle n'existe pas
    const { error: tasksError } = await supabase.rpc('create_tasks_table_if_not_exists');
    
    if (tasksError) {
      console.log('⚠️ Erreur création table tasks (peut-être déjà existante):', tasksError.message);
      
      // Essayer de créer la table manuellement avec SQL
      const { error: sqlTasksError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            credits INTEGER NOT NULL DEFAULT 1,
            actions_restantes INTEGER NOT NULL,
            createur TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlTasksError) {
        console.log('⚠️ Erreur SQL création table tasks:', sqlTasksError.message);
      }
    }
    
    // Créer la table task_completions si elle n'existe pas
    const { error: completionsError } = await supabase.rpc('create_task_completions_table_if_not_exists');
    
    if (completionsError) {
      console.log('⚠️ Erreur création table task_completions (peut-être déjà existante):', completionsError.message);
      
      // Essayer de créer la table manuellement avec SQL
      const { error: sqlCompletionsError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS task_completions (
            id TEXT PRIMARY KEY,
            exchange_task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (sqlCompletionsError) {
        console.log('⚠️ Erreur SQL création table task_completions:', sqlCompletionsError.message);
      }
    }
    
    // Créer la table app_stats si elle n'existe pas
    const { error: statsError } = await supabase.rpc('create_app_stats_table_if_not_exists');
    
    if (statsError) {
      console.log('⚠️ Erreur création table app_stats (peut-être déjà existante):', statsError.message);
      
      // Essayer de créer la table manuellement avec SQL
      const { error: sqlStatsError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS app_stats (
            id TEXT PRIMARY KEY DEFAULT 'main',
            user_count INTEGER NOT NULL DEFAULT 1787,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          INSERT INTO app_stats (id, user_count, last_updated)
          VALUES ('main', 1787, NOW())
          ON CONFLICT (id) DO NOTHING;
        `
      });
      
      if (sqlStatsError) {
        console.log('⚠️ Erreur SQL création table app_stats:', sqlStatsError.message);
      }
    }
    
    // Vérifier que les tables existent maintenant
    const tables = ['tasks', 'task_completions', 'app_stats'];
    const results: any = {};
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          results[tableName] = { error: error.message };
        } else {
          results[tableName] = { 
            success: true, 
            count: data?.length || 0
          };
        }
      } catch (err) {
        results[tableName] = { error: err instanceof Error ? err.message : String(err) };
      }
    }
    
    console.log('✅ Initialisation terminée');
    
    return NextResponse.json({
      success: true,
      message: 'Tables initialisées avec succès',
      tables: results
    });
    
  } catch (error) {
    console.error('❌ Erreur initialisation tables:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'initialisation des tables',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 