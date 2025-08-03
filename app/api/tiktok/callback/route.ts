import { NextRequest, NextResponse } from 'next/server';
import { TIKTOK_CONFIG } from '../../../config/tiktok';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Vérifier s'il y a une erreur
    if (error) {
      console.error('Erreur TikTok OAuth:', error);
      return NextResponse.redirect(new URL('/dashboard?error=tiktok_auth_failed', request.url));
    }

    // Vérifier que le code est présent
    if (!code) {
      console.error('Code d\'autorisation manquant');
      return NextResponse.redirect(new URL('/dashboard?error=no_auth_code', request.url));
    }

    // Échanger le code contre un token
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
      const errorData = await tokenResponse.text();
      console.error('Erreur lors de l\'échange du token:', errorData);
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    
    // Stocker le token (dans un vrai projet, utilisez une base de données)
    console.log('Token TikTok obtenu:', {
      access_token: tokenData.access_token?.substring(0, 10) + '...',
      expires_in: tokenData.expires_in,
      open_id: tokenData.open_id
    });

    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(new URL('/dashboard?success=tiktok_auth&tab=tiktok', request.url));

  } catch (error) {
    console.error('Erreur dans le callback TikTok:', error);
    return NextResponse.redirect(new URL('/dashboard?error=callback_error', request.url));
  }
} 