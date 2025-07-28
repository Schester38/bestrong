import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET - Récupérer tous les trackings complétés d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        error: "userId requis" 
      }, { status: 400 });
    }

    // Récupérer tous les trackings complétés et récents (moins de 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: trackings, error } = await supabase
      .from('task_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', fiveMinutesAgo)
      .eq('clicked_view', true)
      .eq('left_app', true)
      .eq('returned_to_app', true);

    if (error) {
      console.error('Erreur récupération trackings:', error);
      return NextResponse.json({ 
        error: "Erreur lors de la récupération des trackings" 
      }, { status: 500 });
    }

    // Créer un map des tâches complétées
    const completedTasks = trackings?.reduce((acc, tracking) => {
      acc[tracking.task_url] = {
        id: tracking.id,
        taskUrl: tracking.task_url,
        actionType: tracking.action_type,
        completedAt: tracking.created_at
      };
      return acc;
    }, {} as Record<string, any>) || {};

    return NextResponse.json({
      success: true,
      completedTasks,
      count: Object.keys(completedTasks).length
    });

  } catch (error) {
    console.error('Erreur GET /api/tracking/user-completions:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des complétions" 
    }, { status: 500 });
  }
} 