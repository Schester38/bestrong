import { NextRequest, NextResponse } from 'next/server';
import { TIKTOK_CONFIG, getAuthUrl } from '../../../config/tiktok';

export async function GET(request: NextRequest) {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({
      success: true,
      auth_url: authUrl,
      message: 'URL d\'authentification générée'
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { redirect_uri } = body;

    // Utiliser l'URL de redirection personnalisée si fournie
    const customRedirectUri = redirect_uri || TIKTOK_CONFIG.REDIRECT_URI;

    const params = new URLSearchParams({
      client_key: TIKTOK_CONFIG.CLIENT_KEY,
      scope: TIKTOK_CONFIG.SCOPES,
      response_type: 'code',
      redirect_uri: customRedirectUri,
      state: Math.random().toString(36).substring(7)
    });

    const authUrl = `${TIKTOK_CONFIG.AUTH_URL}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      auth_url: authUrl,
      redirect_uri: customRedirectUri,
      message: 'URL d\'authentification générée avec URL personnalisée'
    });
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération de l\'URL'
    }, { status: 500 });
  }
} 