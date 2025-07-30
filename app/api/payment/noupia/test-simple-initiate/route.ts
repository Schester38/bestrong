import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test simple d\'initiation de paiement');
    
    const body = await request.json();
    console.log('📥 Données reçues:', JSON.stringify(body, null, 2));
    
    // Validation simple
    if (!body.amount || !body.phone || !body.email || !body.name) {
      return NextResponse.json({
        success: false,
        message: 'Paramètres manquants',
        received: body
      }, { status: 400 });
    }
    
    // Détecter l'opérateur basé sur le numéro de téléphone
    const phone = body.phone.replace(/\D/g, '').replace(/^237/, '');
    let detectedOperator = 'MTN Mobile Money';
    let ussdCode = '*126#';
    
    // Logique de détection basée sur les préfixes Cameroun
    if (phone.startsWith('69') || phone.startsWith('65')) {
      detectedOperator = 'Orange Money';
      ussdCode = '#150#';
    } else if (phone.startsWith('67') || phone.startsWith('68')) {
      detectedOperator = 'MTN Mobile Money';
      ussdCode = '*126#';
    }
    
    // Si un opérateur spécifique est demandé, l'utiliser
    if (body.operator && body.operator !== 'auto') {
      if (body.operator === 'orange') {
        detectedOperator = 'Orange Money';
        ussdCode = '#150#';
      } else if (body.operator === 'mtn') {
        detectedOperator = 'MTN Mobile Money';
        ussdCode = '*126#';
      }
    }
    
    // Simuler une réponse réussie
    const mockResponse = {
      success: true,
      message: 'Test d\'initiation réussi',
      data: {
        transaction: `TEST_${Date.now()}`,
        ussd: ussdCode,
        channel: detectedOperator,
        amount: body.amount,
        fee: 2,
        currency: body.currency || 'XAF'
      },
      test: true,
      detection: {
        phone: phone,
        detectedOperator: detectedOperator,
        ussdCode: ussdCode,
        requestedOperator: body.operator
      }
    };
    
    console.log('✅ Test réussi:', mockResponse);
    
    return NextResponse.json(mockResponse);
    
  } catch (error) {
    console.error('❌ Erreur test simple:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test simple',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 