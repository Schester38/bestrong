import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Activity {
  id: string;
  user_id: string;
  user_phone: string;
  user_pseudo?: string;
  type: 'login' | 'register' | 'logout' | 'task_created' | 'task_completed' | 'credits_earned' | 'credits_spent';
  description: string;
  details?: Record<string, unknown>;
  timestamp: string;
  credits?: number;
}

// API pour récupérer les activités
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filtrer par utilisateur si spécifié
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Filtrer par date si spécifié
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data: activities, error } = await query;

    if (error) {
      console.error('Erreur récupération activités:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des activités' },
        { status: 500 }
      );
    }
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const transformedActivities = activities?.map(activity => ({
      id: activity.id,
      userId: activity.user_id,
      userPhone: activity.user_phone,
      userPseudo: activity.user_pseudo,
      type: activity.type,
      description: activity.description,
      credits: activity.credits,
      details: activity.details,
      timestamp: activity.created_at
    })) || [];
    
    return NextResponse.json({
      activities: transformedActivities,
      total: transformedActivities.length
    });

  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// API pour ajouter une activité
export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    
    // Validation des données
    if (!activityData.userId || !activityData.userPhone || !activityData.type || !activityData.description) {
      return NextResponse.json(
        { error: 'Données d\'activité incomplètes' },
        { status: 400 }
      );
    }

    const newActivity = {
      id: Date.now().toString(),
      user_id: activityData.userId,
      user_phone: activityData.userPhone,
      user_pseudo: activityData.userPseudo,
      type: activityData.type,
      description: activityData.description,
      details: activityData.details,
      credits: activityData.credits,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('activities')
      .insert(newActivity);

    if (error) {
      console.error('Erreur création activité:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout de l\'activité' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Activité ajoutée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 