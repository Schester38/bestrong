import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneWithPrefix = body.phone || '237672886348';
    
    // Nettoyer le numéro : supprimer l'indicatif pays 237
    const phoneLocal = phoneWithPrefix.replace(/\D/g, '').replace(/^237/, '');
    
    console.log('🎯 Test final Noupia - Intégration complète');
    console.log('📱 Numéro original:', phoneWithPrefix);
    console.log('📱 Numéro local (sans 237):', phoneLocal);
    
    // Test 1: Sans opérateur (auto-détection)
    const testData1 = {
      operation: 'initiate',
      reference: `FINAL${Date.now()}`,
      amount: 100,
      phone: phoneLocal, // Numéro sans indicatif pays
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User'
      // Pas d'opérateur - auto-détection
    };
    
    console.log('📤 Test 1 - Auto-détection avec numéro local:', JSON.stringify(testData1, null, 2));
    
    const response1 = await fetch('https://api.noupia.com/pay', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'User-Agent': 'BE-STRONG-APP/1.0',
        'Noupia-API-Signature': 'np-live',
        'Noupia-API-Key': NOUPIA_DEVELOPER_KEY,
        'Noupia-Product-Key': NOUPIA_SUBSCRIPTION_KEY,
        'Noupia-API-Version': '1.0',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testData1)
    });
    
    const responseText1 = await response1.text();
    console.log('✅ Réponse auto-détection:', responseText1);
    
    // Test 2: Avec opérateur MTN
    const testData2 = {
      operation: 'initiate',
      reference: `FINALMTN${Date.now()}`,
      amount: 100,
      phone: phoneLocal, // Numéro sans indicatif pays
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User',
      operator: 'mtn' // Opérateur MTN
    };
    
    console.log('📤 Test 2 - Avec opérateur MTN:', JSON.stringify(testData2, null, 2));
    
    const response2 = await fetch('https://api.noupia.com/pay', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'User-Agent': 'BE-STRONG-APP/1.0',
        'Noupia-API-Signature': 'np-live',
        'Noupia-API-Key': NOUPIA_DEVELOPER_KEY,
        'Noupia-Product-Key': NOUPIA_SUBSCRIPTION_KEY,
        'Noupia-API-Version': '1.0',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(testData2)
    });
    
    const responseText2 = await response2.text();
    console.log('✅ Réponse avec MTN:', responseText2);
    
    // Analyser les réponses
    let result1, result2;
    try {
      result1 = JSON.parse(responseText1);
    } catch {
      result1 = { raw: responseText1 };
    }
    
    try {
      result2 = JSON.parse(responseText2);
    } catch {
      result2 = { raw: responseText2 };
    }
    
    const success1 = response1.status === 201 && responseText1.includes('OPERATION_SUCCESSFUL');
    
    const success2 = response2.status === 201 && responseText2.includes('OPERATION_SUCCESSFUL');
    
    return NextResponse.json({
      success: true,
      message: 'Test final Noupia terminé',
      phone: {
        original: phoneWithPrefix,
        local: phoneLocal,
        cleaned: phoneLocal
      },
      tests: [
        {
          name: 'Auto-détection (sans opérateur)',
          data: testData1,
          status: response1.status,
          response: result1,
          rawResponse: responseText1,
          success: success1,
          ussdSent: responseText1.includes('channel_ussd') || success1
        },
        {
          name: 'Avec opérateur MTN',
          data: testData2,
          status: response2.status,
          response: result2,
          rawResponse: responseText2,
          success: success2,
          ussdSent: responseText2.includes('channel_ussd') || success2
        }
      ],
      analysis: {
        autoDetectionWorks: success1,
        mtnOperatorWorks: success2,
        ussdReceived: success1 || success2,
        recommendation: success1 || success2 
          ? '✅ Intégration Noupia réussie ! Utilisez le numéro sans indicatif pays (237).'
          : '❌ Problème persistant. Vérifier la documentation Noupia.'
      },
      integration: {
        phoneFormat: 'local', // Sans indicatif pays
        operator: success1 ? 'auto' : (success2 ? 'mtn' : 'unknown'),
        status: success1 || success2 ? 'working' : 'failed'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test final:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test final',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 