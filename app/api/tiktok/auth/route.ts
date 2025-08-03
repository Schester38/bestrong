import { NextRequest, NextResponse } from 'next/server';
import { TIKTOK_CONFIG, getAuthUrl } from '../../../config/tiktok';

export async function GET(request: NextRequest) {
  try {
    // Générer l'URL d'authentification TikTok
    const authUrl = getAuthUrl();
    
    return NextResponse.json({
      success: true,
      auth_url: authUrl,
      client_key: TIKTOK_CONFIG.CLIENT_KEY,
      scopes: TIKTOK_CONFIG.SCOPES,
      redirect_uri: TIKTOK_CONFIG.REDIRECT_URI,
      message: 'URL d\'authentification TikTok générée'
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code d\'autorisation requis' },
        { status: 400 }
      );
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch(TIKTOK_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CONFIG.CLIENT_KEY,
        client_secret: TIKTOK_CONFIG.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_CONFIG.REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erreur TikTok API:', errorData);
      
      return NextResponse.json(
        { error: 'Erreur lors de l\'échange du token', details: errorData },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      open_id: tokenData.open_id,
      scope: tokenData.scope,
      message: 'Authentification TikTok réussie'
    });

  } catch (error) {
    console.error('Erreur lors de l\'authentification TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 