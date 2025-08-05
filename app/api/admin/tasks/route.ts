import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// GET: Récupérer toutes les tâches avec leurs détails
export async function GET() {
  try {
    console.log('🔄 Récupération de toutes les tâches pour l\'admin...');
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Erreur récupération tâches:', tasksError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tâches' }, { status: 500 });
    }

    console.log(`✅ ${tasks?.length || 0} tâches récupérées`);

    // Récupérer les complétions pour chaque tâche
    const tasksWithCompletions = await Promise.all((tasks || []).map(async (task) => {
      try {
        const { data: completions, error: completionsError } = await supabase
          .from('task_completions')
          .select('*')
          .eq('exchange_task_id', task.id);

        if (completionsError) {
          console.error('⚠️ Erreur récupération complétions pour tâche', task.id, ':', completionsError);
        }

        return {
          id: task.id,
          type: task.type,
          url: task.url,
          credits: task.credits,
          actionsRestantes: task.actions_restantes,
          createur: task.createur,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completions: completions || [],
          completionCount: completions?.length || 0
        };
      } catch (error) {
        console.error('❌ Erreur lors du traitement de la tâche', task.id, ':', error);
        return {
          id: task.id,
          type: task.type,
          url: task.url,
          credits: task.credits,
          actionsRestantes: task.actions_restantes,
          createur: task.createur,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          completions: [],
          completionCount: 0
        };
      }
    }));

    return NextResponse.json({
      tasks: tasksWithCompletions,
      total: tasksWithCompletions.length
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
}

// DELETE: Supprimer des tâches spécifiques
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskIds } = body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Liste des IDs de tâches requise' }, { status: 400 });
    }

    console.log('🗑️ Suppression de', taskIds.length, 'tâches...');

    // Supprimer les complétions associées d'abord
    const { error: completionsError } = await supabase
      .from('task_completions')
      .delete()
      .in('exchange_task_id', taskIds);

    if (completionsError) {
      console.error('❌ Erreur suppression complétions:', completionsError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression des complétions' 
      }, { status: 500 });
    }

    // Supprimer les tâches
    const { data: deletedTasks, error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .in('id', taskIds);

    if (tasksError) {
      console.error('❌ Erreur suppression tâches:', tasksError);
      return NextResponse.json({ 
        error: 'Erreur lors de la suppression des tâches' 
      }, { status: 500 });
    }

    console.log('✅', taskIds.length, 'tâches supprimées avec succès');

    return NextResponse.json({ 
      success: true, 
      message: `${taskIds.length} tâche(s) supprimée(s) avec succès`,
      deletedCount: taskIds.length
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
} 