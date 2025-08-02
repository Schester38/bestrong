import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json({ error: 'ID de tâche requis' }, { status: 400 });
    }
    
    console.log('Test tâche avec ID:', taskId);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test de recherche de la tâche
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) {
      console.error('Erreur recherche tâche:', error);
      return NextResponse.json({ 
        error: 'Tâche non trouvée', 
        details: error.message,
        taskId: taskId
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      task: data
    });
    
  } catch (error) {
    console.error('Erreur test tâche:', error);
    return NextResponse.json({ 
      error: 'Erreur générale', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 