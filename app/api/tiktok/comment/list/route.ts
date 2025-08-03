import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('video_id');
    const commentIds = searchParams.get('comment_ids');
    const includeReplies = searchParams.get('include_replies') === 'true';

    // Validation des paramètres
    if (!videoId) {
      return NextResponse.json(
        { error: 'video_id est requis' },
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

    // Préparer les paramètres de requête
    const queryParams = new URLSearchParams({
      business_id: businessId,
      video_id: videoId
    });

    if (commentIds) {
      queryParams.append('comment_ids', commentIds);
    }

    if (includeReplies) {
      queryParams.append('include_replies', 'true');
    }

    // Appel à l'API TikTok pour lister les commentaires
    const response = await fetch(`https://open.tiktokapis.com/v2/business/comment/list/?${queryParams}`, {
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
        { error: 'Erreur lors de la récupération des commentaires', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Traiter et formater les commentaires
    const comments = data.data?.comments || [];
    const formattedComments = comments.map((comment: any) => ({
      comment_id: comment.comment_id,
      text: comment.text,
      create_time: comment.create_time,
      like_count: comment.like_count,
      reply_count: comment.reply_count,
      is_hidden: comment.is_hidden,
      user: {
        user_id: comment.user?.user_id,
        username: comment.user?.username,
        display_name: comment.user?.display_name,
        avatar_url: comment.user?.avatar_url
      },
      replies: comment.replies?.map((reply: any) => ({
        comment_id: reply.comment_id,
        text: reply.text,
        create_time: reply.create_time,
        like_count: reply.like_count,
        is_hidden: reply.is_hidden,
        user: {
          user_id: reply.user?.user_id,
          username: reply.user?.username,
          display_name: reply.user?.display_name,
          avatar_url: reply.user?.avatar_url
        }
      })) || []
    }));

    return NextResponse.json({
      success: true,
      comments: formattedComments,
      total_count: formattedComments.length,
      has_more: data.data?.has_more || false,
      cursor: data.data?.cursor
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 