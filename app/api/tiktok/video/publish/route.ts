import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      video_url, 
      title, 
      description, 
      hashtags, 
      privacy_level = 'public',
      disable_duet = false,
      disable_comment = false,
      disable_stitch = false
    } = body;

    // Validation des paramètres requis
    if (!video_url) {
      return NextResponse.json(
        { error: 'video_url est requis' },
        { status: 400 }
      );
    }

    // Validation de l'URL vidéo
    const urlRegex = /^https:\/\/.+/;
    if (!urlRegex.test(video_url)) {
      return NextResponse.json(
        { error: 'video_url doit être une URL HTTPS valide' },
        { status: 400 }
      );
    }

    // Validation du niveau de confidentialité
    if (!['public', 'private', 'friends'].includes(privacy_level)) {
      return NextResponse.json(
        { error: 'privacy_level doit être "public", "private" ou "friends"' },
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

    // Préparer les données pour l'API TikTok
    const publishData: any = {
      video_url: video_url,
      privacy_level: privacy_level,
      disable_duet: disable_duet,
      disable_comment: disable_comment,
      disable_stitch: disable_stitch
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (title) publishData.title = title;
    if (description) publishData.description = description;
    if (hashtags && Array.isArray(hashtags)) {
      publishData.hashtags = hashtags;
    }

    // Appel à l'API TikTok pour publier la vidéo
    const response = await fetch('https://open.tiktokapis.com/v2/business/video/publish/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(publishData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur TikTok API:', errorData);
      
      // Gérer les erreurs spécifiques
      if (errorData.error?.code === 'VIDEO_URL_NOT_VERIFIED') {
        return NextResponse.json(
          { 
            error: 'URL vidéo non vérifiée',
            message: 'L\'URL de la vidéo doit provenir d\'une propriété vérifiée. Veuillez d\'abord vérifier votre domaine ou URL prefix.',
            details: errorData
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la publication de la vidéo', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      video_id: data.data?.video_id,
      message: 'Vidéo publiée avec succès',
      publish_time: new Date().toISOString(),
      video_url: video_url,
      privacy_level: privacy_level
    });

  } catch (error) {
    console.error('Erreur lors de la publication de vidéo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 