import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur a un token TikTok valide
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ connected: false });
    }

    const token = authHeader.substring(7);
    
    // Récupérer le type de compte depuis les cookies
    const accountType = request.cookies.get('tiktok_account_type')?.value || 'personal';
    
    // Vérifier la validité du token avec TikTok API
    const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return NextResponse.json({ 
        connected: true, 
        accessToken: token,
        accountType: accountType
      });
    } else {
      return NextResponse.json({ connected: false });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut TikTok:', error);
    return NextResponse.json({ connected: false });
  }
} 