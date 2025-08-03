import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Format: "username|accountType"
    const error = searchParams.get('error');

    // Parser le state pour extraire username et accountType
    const [username, accountType] = (state || '').split('|');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed&message=${encodeURIComponent('Erreur lors de l\'authentification TikTok')}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed&message=${encodeURIComponent('Code d\'autorisation manquant')}`
      );
    }

    // Configuration selon le type de compte
    const clientId = accountType === 'business' 
      ? process.env.TIKTOK_BUSINESS_CLIENT_ID!
      : process.env.TIKTOK_PERSONAL_CLIENT_ID!;
    
    const clientSecret = accountType === 'business'
      ? process.env.TIKTOK_BUSINESS_CLIENT_SECRET!
      : process.env.TIKTOK_PERSONAL_CLIENT_SECRET!;

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/tiktok/callback`
      })
    });

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du token:', await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed&message=${encodeURIComponent('Erreur lors de l\'obtention du token')}`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.data?.access_token;
    const refreshToken = tokenData.data?.refresh_token;

    if (!accessToken) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed&message=${encodeURIComponent('Token d\'accès non reçu')}`
      );
    }

    // Stocker le token de manière sécurisée (session, base de données, etc.)
    // Pour cet exemple, nous utilisons un cookie sécurisé
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=tiktok_connected&username=${encodeURIComponent(username || '')}&accountType=${accountType || 'personal'}`
    );

    // Stocker le token dans un cookie sécurisé
    response.cookies.set('tiktok_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    // Stocker le type de compte
    response.cookies.set('tiktok_account_type', accountType || 'personal', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    if (refreshToken) {
      response.cookies.set('tiktok_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 jours
      });
    }

    return response;

  } catch (error) {
    console.error('Erreur lors du callback TikTok:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=tiktok_auth_failed&message=${encodeURIComponent('Erreur inattendue lors de l\'authentification')}`
    );
  }
} 