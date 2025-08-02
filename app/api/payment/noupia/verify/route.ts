import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA depuis .env.local
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY!;
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY!;

interface NoupiaVerifyRequest {
  transactionId: string;
}

interface NoupiaVerifyResponse {
  response: string;
  code: string;
  message: string;
  data?: {
    transaction: string;
    type: string;
    status: 'successful' | 'failed' | 'pending';
    amount: string;
    fee: string;
    currency: string;
    reference: string;
    description: string;
    date: string;
    time: string;
    timestamp: number;
    method: string;
    payer: string;
    call: string;
    country: string;
    ip: string;
    metadata?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier que les clés API sont disponibles
    if (!NOUPIA_DEVELOPER_KEY || !NOUPIA_SUBSCRIPTION_KEY) {
      console.error('❌ Clés API NOUPIA manquantes');
      return NextResponse.json({
        response: 'error',
        code: 'MISSING_API_KEYS',
        message: 'Configuration API manquante'
      }, { status: 500 });
    }

    const body: NoupiaVerifyRequest = await request.json();

    // Validation des données
    if (!body.transactionId) {
      return NextResponse.json({
        response: 'error',
        code: 'MISSING_TRANSACTION',
        message: 'ID de transaction manquant'
      }, { status: 400 });
    }

    console.log('🔍 Vérification paiement NOUPIA:', body.transactionId);

    // Appel API NOUPIA RÉELLE pour vérification
    console.log('🌐 Appel API NOUPIA réelle pour vérification...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

    const response = await fetch('https://api.noupia.com/pay', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Noupia-API-Signature': 'np-live',
        'Noupia-API-Key': NOUPIA_DEVELOPER_KEY,
        'Noupia-Product-Key': NOUPIA_SUBSCRIPTION_KEY
      },
      body: JSON.stringify({
        operation: 'verify',
        transaction: body.transactionId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('📡 Réponse vérification NOUPIA status:', response.status);

    const responseText = await response.text();
    console.log('📡 Réponse vérification NOUPIA texte:', responseText);

    let result: NoupiaVerifyResponse;

    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON vérification:', parseError);
      return NextResponse.json({
        response: 'error',
        code: 'INVALID_RESPONSE',
        message: 'Réponse invalide de l\'API NOUPIA'
      }, { status: 500 });
    }

    console.log('📡 Réponse vérification NOUPIA parsée:', result);

    if (result.response === 'success' && result.data) {
      console.log('✅ Vérification réussie (API RÉELLE), statut:', result.data.status);
      return NextResponse.json(result);
    } else {
      console.error('❌ Erreur vérification NOUPIA:', result);
      return NextResponse.json({
        response: 'error',
        code: 'VERIFICATION_FAILED',
        message: result.message || 'Erreur lors de la vérification'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erreur vérification paiement NOUPIA:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        response: 'error',
        code: 'TIMEOUT',
        message: 'Délai d\'attente dépassé lors de la vérification'
      }, { status: 408 });
    }
    
    return NextResponse.json({
      response: 'error',
      code: 'INTERNAL_ERROR',
      message: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
} 