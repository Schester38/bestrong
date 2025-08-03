import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, comment_id, text } = body;

    // Validation des paramètres
    if (!item_id) {
      return NextResponse.json(
        { error: 'item_id est requis' },
        { status: 400 }
      );
    }

    if (!comment_id) {
      return NextResponse.json(
        { error: 'comment_id est requis' },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'text est requis et ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (text.length > 150) {
      return NextResponse.json(
        { error: 'Le texte ne peut pas dépasser 150 caractères' },
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

    // Appel à l'API TikTok pour répondre au commentaire
    const response = await fetch('https://open.tiktokapis.com/v2/business/comment/reply/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_id: businessId,
        item_id: item_id,
        comment_id: comment_id,
        text: text.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      
      // Gérer les erreurs spécifiques
      if (errorData.error?.code === 'INSUFFICIENT_PERMISSION') {
        return NextResponse.json(
          { 
            error: 'Permissions insuffisantes',
            message: 'Le token d\'accès doit avoir la permission comment.manage.',
            details: errorData
          },
          { status: 403 }
        );
      }

      if (errorData.error?.code === 'ITEM_NOT_FOUND') {
        return NextResponse.json(
          { 
            error: 'Publication non trouvée',
            message: 'La publication spécifiée n\'existe pas ou n\'est pas accessible.',
            details: errorData
          },
          { status: 404 }
        );
      }

      if (errorData.error?.code === 'COMMENT_NOT_FOUND') {
        return NextResponse.json(
          { 
            error: 'Commentaire non trouvé',
            message: 'Le commentaire spécifié n\'existe pas ou n\'est pas accessible.',
            details: errorData
          },
          { status: 404 }
        );
      }

      if (errorData.error?.code === 'COMMENT_REPLY_DISABLED') {
        return NextResponse.json(
          { 
            error: 'Réponses désactivées',
            message: 'Les réponses aux commentaires sont désactivées pour cette publication.',
            details: errorData
          },
          { status: 400 }
        );
      }

      if (errorData.error?.code === 'COMMENT_TOO_FREQUENT') {
        return NextResponse.json(
          { 
            error: 'Réponse trop fréquente',
            message: 'Vous répondez trop fréquemment. Veuillez attendre avant de répondre à nouveau.',
            details: errorData
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la réponse au commentaire', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      reply_comment_id: data.data?.comment_id,
      item_id: item_id,
      parent_comment_id: comment_id,
      text: text.trim(),
      message: 'Réponse au commentaire publiée avec succès',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la réponse au commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 