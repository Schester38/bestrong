import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/app/utils/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { userId, creditsEarned, reason } = await request.json();

    if (!userId || !creditsEarned || !reason) {
      return NextResponse.json({ 
        error: 'User ID, creditsEarned et reason requis' 
      }, { status: 400 });
    }

    // Créer une notification de crédits gagnés
    const success = await NotificationService.createCreditsNotification(
      userId, 
      creditsEarned, 
      reason
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Notification de crédits envoyée'
      });
    } else {
      return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erreur API notification crédits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 