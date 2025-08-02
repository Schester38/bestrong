import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    console.log('🔍 Debug des tâches - début');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test 1: Vérifier la connexion Supabase
    console.log('🔍 Test 1: Connexion Supabase');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur connexion Supabase:', testError);
      return NextResponse.json({ 
        error: 'Erreur connexion Supabase',
        details: testError.message 
      }, { status: 500 });
    }
    
    // Test 2: Vérifier si la table tasks existe
    console.log('🔍 Test 2: Vérification table tasks');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.error('❌ Erreur table tasks:', tasksError);
      return NextResponse.json({ 
        error: 'Table tasks non accessible',
        details: tasksError.message,
        suggestion: 'Utilisez /api/init-tables pour créer les tables'
      }, { status: 500 });
    }
    
    // Test 3: Vérifier si la table task_completions existe
    console.log('🔍 Test 3: Vérification table task_completions');
    const { data: completionsData, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .limit(1);
    
    if (completionsError) {
      console.error('❌ Erreur table task_completions:', completionsError);
      return NextResponse.json({ 
        error: 'Table task_completions non accessible',
        details: completionsError.message,
        suggestion: 'Utilisez /api/init-tables pour créer les tables'
      }, { status: 500 });
    }
    
    // Test 4: Compter les tâches existantes
    console.log('🔍 Test 4: Comptage des tâches');
    const { count: tasksCount, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erreur comptage tâches:', countError);
    }
    
    console.log('✅ Debug terminé avec succès');
    
    return NextResponse.json({
      success: true,
      message: 'Toutes les tables sont accessibles',
      stats: {
        tasksCount: tasksCount || 0,
        tasksAccessible: true,
        completionsAccessible: true,
        supabaseConnected: true
      },
      tables: {
        users: 'OK',
        tasks: 'OK',
        task_completions: 'OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur générale debug:', error);
    return NextResponse.json({ 
      error: 'Erreur générale',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('🔍 Test création de tâche - début');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test de création d'une tâche simple
    const testTask = {
      id: Date.now().toString(),
      type: 'LIKE',
      url: 'https://www.tiktok.com/@test/video/123',
      credits: 1,
      actions_restantes: 5,
      createur: '+237699486146',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔍 Tentative de création de tâche:', testTask.id);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erreur création tâche:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la création de la tâche',
        details: error.message,
        task: testTask
      }, { status: 500 });
    }
    
    console.log('✅ Tâche créée avec succès:', data);
    
    // Supprimer la tâche de test
    await supabase
      .from('tasks')
      .delete()
      .eq('id', testTask.id);
    
    return NextResponse.json({
      success: true,
      message: 'Test de création de tâche réussi',
      createdTask: data,
      testCompleted: true
    });
    
  } catch (error) {
    console.error('❌ Erreur test création:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du test de création',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 