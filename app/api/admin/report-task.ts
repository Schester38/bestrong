import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans report-task.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

interface Report {
  id: string; // id du signalement
  task_id: string;
  reporter: string; // pseudo ou id
  reason?: string;
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, reporter, reason } = await request.json();
    if (!taskId || !reporter) {
      return NextResponse.json({ error: 'taskId et reporter sont requis' }, { status: 400 });
    }

    const newReport = {
      id: Date.now().toString(),
      task_id: taskId,
      reporter,
      reason,
      date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(newReport)
      .select()
      .single();

    if (error) {
      console.error('Erreur création signalement:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du signalement' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Signalement enregistré', report: data });
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 