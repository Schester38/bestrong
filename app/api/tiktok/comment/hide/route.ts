import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { video_id, comment_id, action } = body;

    // Validation des paramètres
    if (!video_id || !comment_id || !action) {
      return NextResponse.json(
        { error: 'video_id, comment_id et action sont requis' },
        { status: 400 }
      );
    }

    if (!['HIDE', 'UNHIDE'].includes(action)) {
      return NextResponse.json(
        { error: 'action doit être "HIDE" ou "UNHIDE"' },
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

    // Appel à l'API TikTok pour cacher/afficher le commentaire
    const response = await fetch('https://open.tiktokapis.com/v2/business/comment/hide/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_id: businessId,
        video_id: video_id,
        comment_id: comment_id,
        action: action
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de l\'action sur le commentaire', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: action === 'HIDE' ? 'Commentaire caché avec succès' : 'Commentaire affiché avec succès',
      action: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'action sur le commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 