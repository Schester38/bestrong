import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { video_id, comment_id, text } = body;

    // Validation des paramètres
    if (!video_id || !comment_id || !text) {
      return NextResponse.json(
        { error: 'video_id, comment_id et text sont requis' },
        { status: 400 }
      );
    }

    if (text.length > 150) {
      return NextResponse.json(
        { error: 'Le texte de la réponse ne peut pas dépasser 150 caractères' },
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

    // Appel à l'API TikTok pour créer la réponse
    const response = await fetch('https://open.tiktokapis.com/v2/business/comment/reply/create/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_id: businessId,
        video_id: video_id,
        comment_id: comment_id,
        text: text
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réponse', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      reply_id: data.data?.reply_id,
      message: 'Réponse créée avec succès',
      create_time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la création de la réponse:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 