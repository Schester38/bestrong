import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface pour le tracking des actions
interface TaskTracking {
  id: string;
  user_id: string;
  task_url: string;
  action_type: 'LIKE' | 'FOLLOW' | 'COMMENT' | 'SHARE';
  clicked_view: boolean;
  left_app: boolean;
  returned_to_app: boolean;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

// POST - Démarrer le tracking d'une action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskUrl, actionType } = body;

    console.log('🔍 Démarrage tracking:', { userId, taskUrl, actionType });

    if (!userId || !taskUrl || !actionType) {
      console.error('❌ Données manquantes:', { userId, taskUrl, actionType });
      return NextResponse.json({ 
        error: "Données manquantes: userId, taskUrl et actionType requis" 
      }, { status: 400 });
    }

    // Vérifier si la table task_tracking existe
    const { data: tableCheck, error: tableError } = await supabase
      .from('task_tracking')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Table task_tracking non trouvée:', tableError);
      return NextResponse.json({ 
        error: "Table task_tracking non disponible. Veuillez contacter l'administrateur.",
        details: tableError.message
      }, { status: 500 });
    }

    console.log('✅ Table task_tracking disponible');

    // Créer un nouveau tracking
    const newTracking = {
      id: Date.now().toString(),
      user_id: userId,
      task_url: taskUrl,
      action_type: actionType,
      clicked_view: false,
      left_app: false,
      returned_to_app: false,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Tentative d\'insertion tracking:', newTracking);

    const { error } = await supabase
      .from('task_tracking')
      .insert(newTracking);

    if (error) {
      console.error('❌ Erreur création tracking:', error);
      return NextResponse.json({ 
        error: "Erreur lors de la création du tracking",
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Tracking créé avec succès:', newTracking.id);

    return NextResponse.json({ 
      success: true, 
      trackingId: newTracking.id,
      message: "Tracking démarré avec succès" 
    });

  } catch (error) {
    console.error('❌ Erreur POST /api/tracking/task-action:', error);
    return NextResponse.json({ 
      error: "Erreur lors du démarrage du tracking",
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// PATCH - Mettre à jour le tracking
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, action, userId } = body;

    if (!trackingId || !action || !userId) {
      return NextResponse.json({ 
        error: "Données manquantes: trackingId, action et userId requis" 
      }, { status: 400 });
    }

    // Récupérer le tracking actuel
    const { data: currentTracking, error: fetchError } = await supabase
      .from('task_tracking')
      .select('*')
      .eq('id', trackingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentTracking) {
      return NextResponse.json({ 
        error: "Tracking non trouvé" 
      }, { status: 404 });
    }

    // Mettre à jour selon l'action
    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (action) {
      case 'clicked_view':
        updateData.clicked_view = true;
        break;
      case 'left_app':
        updateData.left_app = true;
        break;
      case 'returned_to_app':
        updateData.returned_to_app = true;
        // Si toutes les étapes sont complétées, marquer comme terminé
        if (currentTracking.clicked_view && currentTracking.left_app) {
          updateData.status = 'completed';
        }
        break;
      default:
        return NextResponse.json({ 
          error: "Action non reconnue" 
        }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('task_tracking')
      .update(updateData)
      .eq('id', trackingId);

    if (updateError) {
      console.error('Erreur mise à jour tracking:', updateError);
      return NextResponse.json({ 
        error: "Erreur lors de la mise à jour du tracking" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Action ${action} enregistrée avec succès`,
      isCompleted: updateData.status === 'completed'
    });

  } catch (error) {
    console.error('Erreur PATCH /api/tracking/task-action:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du tracking" 
    }, { status: 500 });
  }
}

// GET - Récupérer le statut d'un tracking
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const trackingId = url.searchParams.get('trackingId');
    const userId = url.searchParams.get('userId');

    if (!trackingId || !userId) {
      return NextResponse.json({ 
        error: "trackingId et userId requis" 
      }, { status: 400 });
    }

    const { data: tracking, error } = await supabase
      .from('task_tracking')
      .select('*')
      .eq('id', trackingId)
      .eq('user_id', userId)
      .single();

    if (error || !tracking) {
      return NextResponse.json({ 
        error: "Tracking non trouvé" 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tracking: {
        id: tracking.id,
        clicked_view: tracking.clicked_view,
        left_app: tracking.left_app,
        returned_to_app: tracking.returned_to_app,
        status: tracking.status,
        created_at: tracking.created_at
      }
    });

  } catch (error) {
    console.error('Erreur GET /api/tracking/task-action:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération du tracking" 
    }, { status: 500 });
  }
} 