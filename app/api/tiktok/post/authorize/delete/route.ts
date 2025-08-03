import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id } = body;

    // Validation des paramètres
    if (!item_id) {
      return NextResponse.json(
        { error: 'item_id est requis' },
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

    // Appel à l'API TikTok pour supprimer l'autorisation
    const response = await fetch('https://open.tiktokapis.com/v2/business/post/authorize/delete/', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        business_id: businessId,
        item_id: item_id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      
      // Gérer les erreurs spécifiques
      if (errorData.error?.code === 'AUTHORIZATION_CODE_NOT_FOUND') {
        return NextResponse.json(
          { 
            error: 'Code d\'autorisation non trouvé',
            message: 'Aucun code d\'autorisation trouvé pour cette publication.',
            details: errorData
          },
          { status: 404 }
        );
      }

      if (errorData.error?.code === 'INSUFFICIENT_PERMISSION') {
        return NextResponse.json(
          { 
            error: 'Permissions insuffisantes',
            message: 'Le token d\'accès doit avoir la permission biz.spark.auth.',
            details: errorData
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'autorisation', details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      item_id: item_id,
      message: 'Code d\'autorisation publicitaire supprimé avec succès',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'autorisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 