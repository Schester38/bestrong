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
    const businessId = request.headers.get('X-Business-ID');

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id est requis' },
        { status: 400 }
      );
    }

    // Récupérer les champs demandés
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields') || 'username,display_name,profile_image,followers_count,audience_countries,audience_genders,likes,comments,shares,profile_views,video_views,audience_activity';

    // Appel à l'API TikTok
    const response = await fetch(`https://open.tiktokapis.com/v2/business/get/?business_id=${businessId}&fields=${fields}`, {
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
        { error: 'Erreur lors de la récupération des données business', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const businessData = data.data;

    // Séparer les données par latence
    const realTimeData = {
      username: businessData.username,
      display_name: businessData.display_name,
      profile_image: businessData.profile_image,
      followers_count_current: businessData.followers_count
    };

    const delayedData = {
      audience_countries: businessData.audience_countries,
      audience_genders: businessData.audience_genders,
      likes: businessData.likes,
      comments: businessData.comments,
      shares: businessData.shares,
      followers_count_net: businessData.followers_count_net,
      profile_views: businessData.profile_views,
      video_views: businessData.video_views,
      audience_activity: businessData.audience_activity,
      date: businessData.date
    };

    // Calculer la date de dernière mise à jour
    const lastUpdate = new Date();
    const delayedUpdate = new Date(lastUpdate.getTime() - 24 * 60 * 60 * 1000); // 24h en arrière

    return NextResponse.json({
      success: true,
      business_id: businessId,
      data: {
        real_time: {
          ...realTimeData,
          last_update: lastUpdate.toISOString(),
          latency: 'none'
        },
        delayed: {
          ...delayedData,
          last_update: delayedUpdate.toISOString(),
          latency: '24-48 hours',
          note: 'Données avec latence de 24-48 heures (UTC)'
        }
      },
      metadata: {
        total_fields: Object.keys(realTimeData).length + Object.keys(delayedData).length,
        real_time_fields: Object.keys(realTimeData).length,
        delayed_fields: Object.keys(delayedData).length,
        cache_recommendation: 'Mettre en cache les données en temps réel, actualiser les données différées toutes les 24h'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données business:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 