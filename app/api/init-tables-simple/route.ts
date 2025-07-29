import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    console.log('🔄 Initialisation simple des tables...');
    
    if (!supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Clé anonyme Supabase manquante',
        message: 'La variable d\'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY n\'est pas définie'
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Vérifier si les tables existent déjà
    console.log('🔍 Vérification des tables existantes...');
    
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    const { data: completionsData, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .limit(1);
    
    const { data: statsData, error: statsError } = await supabase
      .from('app_stats')
      .select('*')
      .limit(1);
    
    const results = {
      tasks: {
        exists: !tasksError,
        error: tasksError?.message || null
      },
      task_completions: {
        exists: !completionsError,
        error: completionsError?.message || null
      },
      app_stats: {
        exists: !statsError,
        error: statsError?.message || null
      }
    };
    
    console.log('📊 État des tables:', results);
    
    // Si toutes les tables existent, retourner le succès
    if (results.tasks.exists && results.task_completions.exists && results.app_stats.exists) {
      return NextResponse.json({
        success: true,
        message: 'Toutes les tables existent déjà',
        tables: results
      });
    }
    
    // Si certaines tables manquent, essayer de les créer avec des insertions de test
    console.log('⚠️ Certaines tables manquent, tentative de création via insertions...');
    
    const createdTables = [];
    
    // Essayer de créer la table tasks via insertion
    if (!results.tasks.exists) {
      try {
        const testTask = {
          id: 'test-init-' + Date.now(),
          type: 'LIKE',
          url: 'https://www.tiktok.com/@test/video/init',
          credits: 1,
          actions_restantes: 1,
          createur: '+237699486146',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(testTask);
        
        if (!insertError) {
          // Supprimer la tâche de test
          await supabase
            .from('tasks')
            .delete()
            .eq('id', testTask.id);
          
          createdTables.push('tasks');
          console.log('✅ Table tasks créée via insertion');
        } else {
          console.log('❌ Impossible de créer tasks:', insertError.message);
        }
      } catch (error) {
        console.log('❌ Erreur création tasks:', error);
      }
    }
    
    // Essayer de créer la table task_completions via insertion
    if (!results.task_completions.exists) {
      try {
        const testCompletion = {
          id: 'test-init-' + Date.now(),
          exchange_task_id: 'test-task-id',
          user_id: 'test-user-id',
          completed_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('task_completions')
          .insert(testCompletion);
        
        if (!insertError) {
          // Supprimer la completion de test
          await supabase
            .from('task_completions')
            .delete()
            .eq('id', testCompletion.id);
          
          createdTables.push('task_completions');
          console.log('✅ Table task_completions créée via insertion');
        } else {
          console.log('❌ Impossible de créer task_completions:', insertError.message);
        }
      } catch (error) {
        console.log('❌ Erreur création task_completions:', error);
      }
    }
    
    // Essayer de créer la table app_stats via insertion
    if (!results.app_stats.exists) {
      try {
        const testStats = {
          id: 'test-init-' + Date.now(),
          user_count: 1787,
          last_updated: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('app_stats')
          .insert(testStats);
        
        if (!insertError) {
          // Supprimer les stats de test
          await supabase
            .from('app_stats')
            .delete()
            .eq('id', testStats.id);
          
          createdTables.push('app_stats');
          console.log('✅ Table app_stats créée via insertion');
        } else {
          console.log('❌ Impossible de créer app_stats:', insertError.message);
        }
      } catch (error) {
        console.log('❌ Erreur création app_stats:', error);
      }
    }
    
    return NextResponse.json({
      success: createdTables.length > 0,
      message: createdTables.length > 0 
        ? `Tables créées: ${createdTables.join(', ')}`
        : 'Impossible de créer les tables manquantes',
      createdTables,
      tables: results,
      note: 'Si les tables ne peuvent pas être créées, contactez l\'administrateur pour configurer les permissions Supabase'
    });
    
  } catch (error) {
    console.error('❌ Erreur initialisation tables:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'initialisation des tables',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 