import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Types pour les événements webhook
interface WebhookEvent {
  client_key: string;
  event: string;
  create_time: number;
  user_openid: string;
  content: string;
}

interface PostPublishFailed {
  publish_id: string;
  reason: string;
  publish_type: string;
}

interface PostPublishComplete {
  publish_id: string;
  publish_type: string;
}

interface PostPublishPubliclyAvailable {
  publish_id: string;
  post_id: string;
  publish_type: string;
}

interface PostPublishNoLongerPubliclyAvailable {
  publish_id: string;
  post_id: string;
  publish_type: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event: WebhookEvent = body;

    // Vérifier la signature du webhook (si configurée)
    const signature = request.headers.get('x-tiktok-signature');
    const webhookSecret = process.env.TIKTOK_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Signature webhook invalide');
        return NextResponse.json(
          { error: 'Signature invalide' },
          { status: 401 }
        );
      }
    }

    // Traiter l'événement selon son type
    let processedEvent;
    let eventData;

    switch (event.event) {
      case 'post.publish.failed':
        eventData = JSON.parse(event.content) as PostPublishFailed;
        processedEvent = {
          type: 'post.publish.failed',
          publish_id: eventData.publish_id,
          reason: eventData.reason,
          publish_type: eventData.publish_type,
          timestamp: new Date(event.create_time * 1000).toISOString(),
          user_openid: event.user_openid
        };
        break;

      case 'post.publish.complete':
        eventData = JSON.parse(event.content) as PostPublishComplete;
        processedEvent = {
          type: 'post.publish.complete',
          publish_id: eventData.publish_id,
          publish_type: eventData.publish_type,
          timestamp: new Date(event.create_time * 1000).toISOString(),
          user_openid: event.user_openid
        };
        break;

      case 'post.publish.publicly_available':
        eventData = JSON.parse(event.content) as PostPublishPubliclyAvailable;
        processedEvent = {
          type: 'post.publish.publicly_available',
          publish_id: eventData.publish_id,
          post_id: eventData.post_id,
          publish_type: eventData.publish_type,
          timestamp: new Date(event.create_time * 1000).toISOString(),
          user_openid: event.user_openid
        };
        break;

      case 'post.publish.no_longer_publicly_available':
        eventData = JSON.parse(event.content) as PostPublishNoLongerPubliclyAvailable;
        processedEvent = {
          type: 'post.publish.no_longer_publicly_available',
          publish_id: eventData.publish_id,
          post_id: eventData.post_id,
          publish_type: eventData.publish_type,
          timestamp: new Date(event.create_time * 1000).toISOString(),
          user_openid: event.user_openid
        };
        break;

      default:
        console.log('Événement webhook non géré:', event.event);
        return NextResponse.json(
          { success: true, message: 'Événement reçu mais non géré' },
          { status: 200 }
        );
    }

    // Enregistrer l'événement dans la base de données ou le cache
    await saveWebhookEvent(processedEvent);

    // Envoyer des notifications si nécessaire
    await handleWebhookNotification(processedEvent);

    console.log('Webhook TikTok traité:', processedEvent);

    return NextResponse.json({
      success: true,
      event_processed: true,
      event_type: processedEvent.type,
      timestamp: processedEvent.timestamp
    });

  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

// Fonction pour sauvegarder l'événement webhook
async function saveWebhookEvent(event: any) {
  try {
    // Ici vous pouvez sauvegarder dans une base de données
    // Pour l'instant, on log simplement
    console.log('Sauvegarde événement webhook:', event);
    
    // Exemple avec une base de données (à implémenter selon vos besoins)
    // await db.webhookEvents.create({
    //   type: event.type,
    //   publish_id: event.publish_id,
    //   post_id: event.post_id,
    //   timestamp: event.timestamp,
    //   user_openid: event.user_openid,
    //   data: event
    // });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'événement:', error);
  }
}

// Fonction pour gérer les notifications
async function handleWebhookNotification(event: any) {
  try {
    switch (event.type) {
      case 'post.publish.failed':
        // Notifier l'échec de publication
        console.log('❌ Publication échouée:', event.reason);
        // await sendNotification('Publication échouée', `Raison: ${event.reason}`);
        break;

      case 'post.publish.complete':
        // Notifier la publication réussie
        console.log('✅ Publication terminée:', event.publish_id);
        // await sendNotification('Publication réussie', `ID: ${event.publish_id}`);
        break;

      case 'post.publish.publicly_available':
        // Notifier que la publication est publique
        console.log('🌍 Publication publique:', event.post_id);
        // await sendNotification('Publication publique', `Post ID: ${event.post_id}`);
        break;

      case 'post.publish.no_longer_publicly_available':
        // Notifier que la publication n'est plus publique
        console.log('🔒 Publication privée:', event.post_id);
        // await sendNotification('Publication privée', `Post ID: ${event.post_id}`);
        break;
    }
  } catch (error) {
    console.error('Erreur lors de la gestion des notifications:', error);
  }
} 