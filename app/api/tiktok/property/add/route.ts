import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_type, property_value } = body;

    // Validation des paramètres
    if (!property_type || !property_value) {
      return NextResponse.json(
        { error: 'property_type et property_value sont requis' },
        { status: 400 }
      );
    }

    if (!['domain', 'url_prefix'].includes(property_type)) {
      return NextResponse.json(
        { error: 'property_type doit être "domain" ou "url_prefix"' },
        { status: 400 }
      );
    }

    // Validation du format selon le type
    if (property_type === 'domain') {
      // Validation du format de domaine
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(property_value)) {
        return NextResponse.json(
          { error: 'Format de domaine invalide' },
          { status: 400 }
        );
      }
    } else if (property_type === 'url_prefix') {
      // Validation du format d'URL prefix
      const urlPrefixRegex = /^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\/.*\/$/;
      if (!urlPrefixRegex.test(property_value)) {
        return NextResponse.json(
          { error: 'Format d\'URL prefix invalide. Doit commencer par https:// et se terminer par /' },
          { status: 400 }
        );
      }
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

    // Appel à l'API TikTok pour ajouter la propriété
    const response = await fetch('https://open.tiktokapis.com/v2/business/property/add/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        property_type: property_type,
        property_value: property_value
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout de la propriété', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Préparer la réponse selon le type de propriété
    const result: any = {
      success: true,
      property_id: data.data?.property_id,
      property_type: property_type,
      property_value: property_value,
      signature: data.data?.signature
    };

    // Ajouter file_name pour les URL prefixes
    if (property_type === 'url_prefix' && data.data?.file_name) {
      result.file_name = data.data.file_name;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erreur lors de l\'ajout de propriété:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 