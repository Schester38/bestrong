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

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || '';
    const maxCount = searchParams.get('max_count') || '20';

    // Appel à l'API TikTok pour lister les vidéos
    const response = await fetch(`https://open.tiktokapis.com/v2/business/video/list/?business_id=${businessId}&cursor=${cursor}&max_count=${maxCount}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      
      // Gérer les erreurs spécifiques
      if (errorData.error?.code === 'INSUFFICIENT_PERMISSION') {
        return NextResponse.json(
          { 
            error: 'Permissions insuffisantes',
            message: 'Le token d\'accès doit avoir les permissions appropriées pour lister les vidéos.',
            details: errorData
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors du chargement des vidéos', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transformer les données pour correspondre à notre interface avec gestion de latence
    const videos = data.data?.videos?.map((video: any) => {
      // Données en temps réel
      const realTimeData = {
        item_id: video.item_id,
        create_time: video.create_time,
        thumbnail_url: video.cover?.url_list?.[0],
        share_url: video.share_url,
        embed_url: video.embed_url,
        caption: video.caption,
        is_ad_promotable: video.is_ad_promotable || false,
        authorization_code: video.authorization_code,
        expires_at: video.expires_at
      };

      // Données avec latence (24-48h)
      const delayedData = {
        video_views: video.stats?.view_count || 0,
        likes: video.stats?.like_count || 0,
        comments: video.stats?.comment_count || 0,
        shares: video.stats?.share_count || 0,
        reach: video.stats?.reach || 0,
        video_duration: video.video?.duration || 0,
        full_video_watched_rate: video.stats?.full_video_watched_rate || 0,
        total_time_watched: video.stats?.total_time_watched || 0,
        average_time_watched: video.stats?.average_time_watched || 0,
        impression_sources: video.stats?.impression_sources || [],
        audience_countries: video.stats?.audience_countries || []
      };

      return {
        ...realTimeData,
        stats: {
          real_time: {
            ...realTimeData,
            last_update: new Date().toISOString(),
            latency: 'none'
          },
          delayed: {
            ...delayedData,
            last_update: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            latency: '24-48 hours',
            note: 'Données avec latence de 24-48 heures (UTC)'
          }
        }
      };
    }) || [];

    return NextResponse.json({
      success: true,
      videos: videos,
      cursor: data.data?.cursor,
      has_more: data.data?.has_more || false,
      total_count: data.data?.total_count || videos.length,
      latency_info: {
        real_time_fields: ['item_id', 'create_time', 'thumbnail_url', 'share_url', 'embed_url', 'caption'],
        delayed_fields: ['video_views', 'likes', 'comments', 'shares', 'reach', 'video_duration', 'full_video_watched_rate', 'total_time_watched', 'average_time_watched', 'impression_sources', 'audience_countries'],
        cache_recommendation: 'Mettre en cache les données en temps réel, actualiser les données différées toutes les 24h'
      }
    });

  } catch (error) {
    console.error('Erreur lors du chargement des vidéos:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 