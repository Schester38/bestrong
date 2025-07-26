import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    console.log('Test Supabase - URL:', supabaseUrl);
    console.log('Test Supabase - Service Key existe:', !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test de connexion basique
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('Erreur table users:', usersError);
      return NextResponse.json({ 
        error: 'Erreur table users', 
        details: usersError.message 
      }, { status: 500 });
    }
    
    // Test table exchange_tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('exchange_tasks')
      .select('count')
      .limit(1);
    
    if (tasksError) {
      console.error('Erreur table exchange_tasks:', tasksError);
      return NextResponse.json({ 
        error: 'Erreur table exchange_tasks', 
        details: tasksError.message 
      }, { status: 500 });
    }
    
    // Test table messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('count')
      .limit(1);
    
    if (messagesError) {
      console.error('Erreur table messages:', messagesError);
      return NextResponse.json({ 
        error: 'Erreur table messages', 
        details: messagesError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Toutes les tables sont accessibles',
      tables: {
        users: 'OK',
        exchange_tasks: 'OK',
        messages: 'OK'
      }
    });
    
  } catch (error) {
    console.error('Erreur test Supabase:', error);
    return NextResponse.json({ 
      error: 'Erreur générale', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 