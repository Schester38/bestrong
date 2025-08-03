import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id } = body;

    // Validation des paramètres
    if (!property_id) {
      return NextResponse.json(
        { error: 'property_id est requis' },
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

    // Appel à l'API TikTok pour vérifier la propriété
    const response = await fetch('https://open.tiktokapis.com/v2/business/property/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        property_id: property_id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la propriété', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Interpréter le statut de vérification
    const propertyStatus = data.data?.property_status;
    let statusText = 'inconnu';
    let isVerified = false;

    if (propertyStatus === 1) {
      statusText = 'vérifié';
      isVerified = true;
    } else if (propertyStatus === 0) {
      statusText = 'non vérifié';
    } else if (propertyStatus === 2) {
      statusText = 'en cours de vérification';
    }

    return NextResponse.json({
      success: true,
      property_id: property_id,
      property_status: propertyStatus,
      status_text: statusText,
      is_verified: isVerified,
      message: isVerified 
        ? 'Propriété vérifiée avec succès. Vous pouvez maintenant publier des vidéos depuis cette URL.'
        : 'Propriété non vérifiée. Veuillez compléter la vérification avant de publier des vidéos.'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de propriété:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 