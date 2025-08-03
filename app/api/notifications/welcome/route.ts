import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/utils/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 });
    }

    // Créer une notification de bienvenue
    const success = await NotificationService.createWelcomeNotification(userId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification de bienvenue envoyée'
      });
    } else {
      return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur API notification bienvenue:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 