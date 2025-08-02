import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    console.log('Test tables - URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test des tables principales
    const tables = [
      'users',
      'tasks', 
      'task_completions',
      'messages',
      'notifications',
      'suggestions',
      'activities',
      'boost_orders'
    ];
    
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
            count: data?.length || 0,
            sample: data?.[0] ? Object.keys(data[0]) : null
          };
        }
      } catch (err) {
        results[tableName] = { error: err instanceof Error ? err.message : String(err) };
      }
    }
    
    return NextResponse.json({
      success: true,
      tables: results
    });
    
  } catch (error) {
    console.error('Erreur test tables:', error);
    return NextResponse.json({ 
      error: 'Erreur générale', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 