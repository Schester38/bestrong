import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans route.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

export async function DELETE(request: NextRequest) {
  try {
    // Supprimer toutes les tâches
    const { data: deletedTasks, error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '0'); // Supprimer toutes les tâches sauf une tâche avec id = '0' (si elle existe)

    if (tasksError) {
      console.error('Erreur suppression tâches:', tasksError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression des tâches' 
      }, { status: 500 });
    }

    // Supprimer toutes les complétions de tâches
    const { data: deletedCompletions, error: completionsError } = await supabase
      .from('task_completions')
      .delete()
      .neq('id', '0'); // Supprimer toutes les complétions sauf une avec id = '0' (si elle existe)

    if (completionsError) {
      console.error('Erreur suppression complétions:', completionsError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression des complétions' 
      }, { status: 500 });
    }

    console.log('Suppression des tâches et complétions terminée');

    return NextResponse.json({ 
      success: true, 
      message: `Toutes les tâches et complétions ont été supprimées avec succès`
    });

  } catch (error) {
    console.error('Erreur DELETE /api/admin/delete-all-tasks:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la suppression' 
    }, { status: 500 });
  }
} 