import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      video_url, 
      description, 
      privacy_level, 
      disable_duet, 
      disable_comment, 
      disable_stitch,
      video_cover_timestamp_ms,
      custom_accessibility_text,
      disable_stitch_duet_comment
    } = body;

    // Validation des paramètres requis
    if (!video_url) {
      return NextResponse.json(
        { error: 'video_url est requis' },
        { status: 400 }
      );
    }

    // Validation de l'URL
    try {
      new URL(video_url);
    } catch {
      return NextResponse.json(
        { error: 'video_url doit être une URL valide' },
        { status: 400 }
      );
    }

    // Validation du niveau de confidentialité
    const validPrivacyLevels = ['PUBLIC', 'FRIENDS', 'PRIVATE'];
    if (privacy_level && !validPrivacyLevels.includes(privacy_level)) {
      return NextResponse.json(
        { error: 'privacy_level doit être PUBLIC, FRIENDS ou PRIVATE' },
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
      video_url: video_url
    };

    // Ajouter les paramètres optionnels
    if (description) requestData.description = description;
    if (privacy_level) requestData.privacy_level = privacy_level;
    if (disable_duet !== undefined) requestData.disable_duet = disable_duet;
    if (disable_comment !== undefined) requestData.disable_comment = disable_comment;
    if (disable_stitch !== undefined) requestData.disable_stitch = disable_stitch;
    if (video_cover_timestamp_ms) requestData.video_cover_timestamp_ms = video_cover_timestamp_ms;
    if (custom_accessibility_text) requestData.custom_accessibility_text = custom_accessibility_text;
    if (disable_stitch_duet_comment !== undefined) requestData.disable_stitch_duet_comment = disable_stitch_duet_comment;

    // Appel à l'API TikTok pour publier la vidéo
    const response = await fetch('https://open.tiktokapis.com/v2/business/video/publish/', {
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
            message: 'Le token d\'accès doit avoir la permission video.publish.',
            details: errorData
          },
          { status: 403 }
        );
      }

      if (errorData.error?.code === 'VIDEO_URL_INVALID') {
        return NextResponse.json(
          { 
            error: 'URL vidéo invalide',
            message: 'L\'URL de la vidéo n\'est pas accessible ou le format n\'est pas supporté.',
            details: errorData
          },
          { status: 400 }
        );
      }

      if (errorData.error?.code === 'VIDEO_SIZE_TOO_LARGE') {
        return NextResponse.json(
          { 
            error: 'Vidéo trop volumineuse',
            message: 'La taille de la vidéo dépasse la limite autorisée.',
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
      publish_id: data.data?.publish_id,
      message: 'Vidéo publiée avec succès. Le statut sera mis à jour via webhook.',
      timestamp: new Date().toISOString(),
      webhook_events: [
        'post.publish.failed',
        'post.publish.complete',
        'post.publish.publicly_available'
      ],
      note: 'La publication peut prendre jusqu\'à 30 minutes selon la taille du fichier'
    });

  } catch (error) {
    console.error('Erreur lors de la publication de la vidéo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 