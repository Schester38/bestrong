import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, is_ad_promotable, authorization_days } = body;

    // Validation des paramètres
    if (!item_id) {
      return NextResponse.json(
        { error: 'item_id est requis' },
        { status: 400 }
      );
    }

    if (typeof is_ad_promotable !== 'boolean') {
      return NextResponse.json(
        { error: 'is_ad_promotable doit être un booléen' },
        { status: 400 }
      );
    }

    if (is_ad_promotable && (!authorization_days || authorization_days < 1 || authorization_days > 365)) {
      return NextResponse.json(
        { error: 'authorization_days doit être entre 1 et 365 jours' },
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
      item_id: item_id,
      is_ad_promotable: is_ad_promotable
    };

    if (is_ad_promotable && authorization_days) {
      requestData.authorization_days = authorization_days;
    }

    // Appel à l'API TikTok pour configurer l'autorisation
    const response = await fetch('https://open.tiktokapis.com/v2/business/post/authorize/setting/', {
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
            message: 'Le token d\'accès doit avoir la permission biz.spark.auth pour gérer les autorisations publicitaires.',
            details: errorData
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la configuration de l\'autorisation', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      item_id: item_id,
      is_ad_promotable: is_ad_promotable,
      authorization_days: authorization_days,
      message: is_ad_promotable 
        ? `Autorisation publicitaire activée pour ${authorization_days} jours`
        : 'Autorisation publicitaire désactivée',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la configuration de l\'autorisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 