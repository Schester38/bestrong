import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'accès
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Appel à l'API TikTok pour lister les propriétés
    const response = await fetch('https://open.tiktokapis.com/v2/business/property/list/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des propriétés', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Traiter et formater les propriétés
    const properties = data.data?.properties || [];
    const formattedProperties = properties.map((property: any) => ({
      property_id: property.property_id,
      property_type: property.property_type,
      property_value: property.property_value,
      property_status: property.property_status,
      status_text: getStatusText(property.property_status),
      is_verified: property.property_status === 1,
      created_time: property.created_time,
      updated_time: property.updated_time
    }));

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
      total_count: formattedProperties.length,
      verified_count: formattedProperties.filter((p: any) => p.is_verified).length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des propriétés:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return 'non vérifié';
    case 1:
      return 'vérifié';
    case 2:
      return 'en cours de vérification';
    default:
      return 'inconnu';
  }
} 