import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhook_url, webhook_secret } = body;

    // Validation des paramètres
    if (!webhook_url) {
      return NextResponse.json(
        { error: 'webhook_url est requis' },
        { status: 400 }
      );
    }

    // Validation de l'URL
    try {
      new URL(webhook_url);
    } catch {
      return NextResponse.json(
        { error: 'webhook_url doit être une URL valide' },
        { status: 400 }
      );
    }

    // Récupérer le token d'accès
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const businessId = request.headers.get('X-Business-ID');

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id est requis' },
        { status: 400 }
      );
    }

    // Préparer les données pour l'API TikTok
    const requestData: any = {
      business_id: businessId,
      webhook_url: webhook_url
    };

    if (webhook_secret) {
      requestData.webhook_secret = webhook_secret;
    }

    // Appel à l'API TikTok pour configurer le webhook
    const response = await fetch('https://open.tiktokapis.com/v2/business/webhook/update/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      
      // Gérer les erreurs spécifiques
      if (errorData.error?.code === 'INSUFFICIENT_PERMISSION') {
        return NextResponse.json(
          { 
            error: 'Permissions insuffisantes',
            message: 'Le token d\'accès doit avoir les permissions appropriées pour configurer les webhooks.',
            details: errorData
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la configuration du webhook', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      webhook_url: webhook_url,
      webhook_secret: webhook_secret,
      message: 'Webhook configuré avec succès',
      timestamp: new Date().toISOString(),
      supported_events: [
        'post.publish.failed',
        'post.publish.complete', 
        'post.publish.publicly_available',
        'post.publish.no_longer_publicly_available'
      ]
    });

  } catch (error) {
    console.error('Erreur lors de la configuration du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 