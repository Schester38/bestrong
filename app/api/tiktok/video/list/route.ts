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

    // Transformer les données pour correspondre à notre interface
    const videos = data.data?.videos?.map((video: any) => ({
      item_id: video.item_id,
      title: video.title || `Vidéo ${video.item_id}`,
      description: video.description || '',
      create_time: video.create_time,
      video_url: video.video?.download_addr?.url_list?.[0],
      image_url: video.cover?.url_list?.[0],
      is_ad_promotable: video.is_ad_promotable || false,
      authorization_code: video.authorization_code,
      expires_at: video.expires_at,
      stats: {
        view_count: video.stats?.view_count || 0,
        like_count: video.stats?.like_count || 0,
        comment_count: video.stats?.comment_count || 0,
        share_count: video.stats?.share_count || 0
      }
    })) || [];

    return NextResponse.json({
      success: true,
      videos: videos,
      cursor: data.data?.cursor,
      has_more: data.data?.has_more || false,
      total_count: data.data?.total_count || videos.length
    });

  } catch (error) {
    console.error('Erreur lors du chargement des vidéos:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 