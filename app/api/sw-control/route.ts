import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'disable') {
      // Désactiver le Service Worker
      return NextResponse.json({ 
        success: true, 
        message: 'Service Worker désactivé',
        action: 'disable'
      });
    } else if (action === 'enable') {
      // Réactiver le Service Worker
      return NextResponse.json({ 
        success: true, 
        message: 'Service Worker réactivé',
        action: 'enable'
      });
    } else {
      return NextResponse.json({ 
        error: 'Action invalide' 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors du contrôle du Service Worker' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Service Worker Control API',
    available: true
  });
} 