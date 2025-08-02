import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Récupérer les notifications de l'utilisateur
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notifications || [],
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