import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    console.log('Test task_completions table');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test simple de la table task_completions
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erreur table task_completions:', error);
      return NextResponse.json({ 
        error: 'Table task_completions non accessible', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table task_completions accessible',
      count: data?.length || 0,
      sample: data?.[0] ? Object.keys(data[0]) : null
    });
    
  } catch (error) {
    console.error('Erreur test task_completions:', error);
    return NextResponse.json({ 
      error: 'Erreur générale', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 