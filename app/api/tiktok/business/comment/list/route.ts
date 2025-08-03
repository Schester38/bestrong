import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const cursor = searchParams.get('cursor') || '';
    const maxCount = searchParams.get('max_count') || '20';

    // Validation des paramètres
    if (!itemId) {
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

    // Appel à l'API TikTok pour lister les commentaires
    const response = await fetch(`https://open.tiktokapis.com/v2/business/comment/list/?business_id=${businessId}&item_id=${itemId}&cursor=${cursor}&max_count=${maxCount}`, {
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

      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commentaires', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transformer les données pour correspondre à notre interface
    const comments = data.data?.comments?.map((comment: any) => ({
      comment_id: comment.comment_id,
      text: comment.text,
      create_time: comment.create_time,
      like_count: comment.like_count || 0,
      reply_count: comment.reply_count || 0,
      user: {
        user_id: comment.user?.user_id,
        username: comment.user?.username,
        display_name: comment.user?.display_name,
        profile_image: comment.user?.profile_image
      },
      is_hidden: comment.is_hidden || false,
      is_liked: comment.is_liked || false,
      parent_comment_id: comment.parent_comment_id
    })) || [];

    return NextResponse.json({
      success: true,
      comments: comments,
      cursor: data.data?.cursor,
      has_more: data.data?.has_more || false,
      total_count: data.data?.total_count || comments.length,
      item_id: itemId
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 