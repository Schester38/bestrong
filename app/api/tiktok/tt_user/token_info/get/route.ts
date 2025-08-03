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

    // Appel à l'API TikTok pour obtenir les informations du token
    const response = await fetch('https://open.tiktokapis.com/v2/tt_user/token_info/get/', {
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
        { error: 'Erreur lors de la récupération des informations du token', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Analyser les permissions
    const scopes = data.data?.scope || [];
    const hasSparkAuth = scopes.includes('biz.spark.auth');
    const hasVideoPublish = scopes.includes('video.publish');
    const hasCommentManage = scopes.includes('comment.manage');

    // Préparer la réponse avec les informations utiles
    const tokenInfo = {
      success: true,
      token_valid: true,
      permissions: {
        spark_auth: hasSparkAuth,
        video_publish: hasVideoPublish,
        comment_manage: hasCommentManage
      },
      scopes: scopes,
      business_id: data.data?.business_id,
      user_id: data.data?.user_id,
      expires_at: data.data?.expires_at,
      message: hasSparkAuth 
        ? 'Token valide avec permissions Spark Ads'
        : 'Token valide mais permissions Spark Ads manquantes'
    };

    return NextResponse.json(tokenInfo);

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 