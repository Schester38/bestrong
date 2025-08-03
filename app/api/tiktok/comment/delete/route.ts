import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { video_id, comment_id } = body;

    // Validation des paramètres
    if (!video_id || !comment_id) {
      return NextResponse.json(
        { error: 'video_id et comment_id sont requis' },
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

    // Appel à l'API TikTok pour supprimer le commentaire
    const response = await fetch('https://open.tiktokapis.com/v2/business/comment/delete/', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_id: businessId,
        video_id: video_id,
        comment_id: comment_id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du commentaire', details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé avec succès',
      deleted_comment_id: comment_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 