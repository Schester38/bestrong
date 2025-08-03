import { NextRequest, NextResponse } from 'next/server';

// Vérifier si Supabase est configuré
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

// Initialiser Supabase seulement si les variables d'environnement sont disponibles
if (supabaseUrl && supabaseServiceKey) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.log('Supabase non disponible:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Vérifier si Supabase est configuré
    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Supabase non configuré, retour des notifications de démonstration');
      return NextResponse.json({
        notifications: [
          {
            id: 'demo-1',
            user_id: userId,
            type: 'achievement',
            title: 'Bienvenue sur BE STRONG !',
            message: 'Vous avez rejoint notre communauté avec succès',
            priority: 'medium',
            read: false,
            created_at: new Date().toISOString(),
            action_url: '/dashboard'
          },
          {
            id: 'demo-2',
            user_id: userId,
            type: 'task',
            title: 'Première tâche disponible',
            message: 'Commencez par compléter votre profil pour gagner des points',
            priority: 'high',
            read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            action_url: '/dashboard?tab=profile'
          }
        ],
        success: true
      });
    }

    // Récupérer les notifications de l'utilisateur
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erreur Supabase:', error);
      // En cas d'erreur Supabase, retourner des notifications de démonstration
      return NextResponse.json({
        notifications: [
          {
            id: 'demo-1',
            user_id: userId,
            type: 'achievement',
            title: 'Bienvenue sur BE STRONG !',
            message: 'Vous avez rejoint notre communauté avec succès',
            priority: 'medium',
            read: false,
            created_at: new Date().toISOString(),
            action_url: '/dashboard'
          }
        ],
        success: true
      });
    }

    return NextResponse.json({
      notifications: notifications || [],
      success: true
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    // En cas d'erreur générale, retourner des notifications de démonstration
    const { searchParams } = new URL(request.url);
    const fallbackUserId = searchParams.get('userId') || 'unknown';
    return NextResponse.json({
      notifications: [
        {
          id: 'demo-1',
          user_id: fallbackUserId,
          type: 'achievement',
          title: 'Bienvenue sur BE STRONG !',
          message: 'Vous avez rejoint notre communauté avec succès',
          priority: 'medium',
          read: false,
          created_at: new Date().toISOString(),
          action_url: '/dashboard'
        }
      ],
      success: true
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, priority = 'medium', actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title et message sont requis' },
        { status: 400 }
      );
    }

    // Créer une nouvelle notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority,
        action_url: actionUrl,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notification,
      success: true
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, read, userId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId est requis' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (read !== undefined) updateData.read = read;

    // Mettre à jour la notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notification,
      success: true
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId est requis' },
        { status: 400 }
      );
    }

    // Supprimer la notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 