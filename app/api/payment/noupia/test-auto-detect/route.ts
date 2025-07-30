import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '237672886348';
    
    console.log('🧪 Test auto-détection Noupia pour MTN Cameroun');
    console.log('📱 Numéro:', phone);
    
    // Test 1: Sans opérateur (auto-détection)
    const testData1 = {
      operation: 'initiate',
      reference: `AUTO${Date.now()}`,
      amount: 100,
      phone: phone,
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User'
      // Pas d'opérateur - auto-détection
    };
    
    console.log('📤 Test 1 - Auto-détection:', JSON.stringify(testData1, null, 2));
    
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
    
    // Test 2: Avec opérateur vide
    const testData2 = {
      operation: 'initiate',
      reference: `EMPTY${Date.now()}`,
      amount: 100,
      phone: phone,
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User',
      operator: '' // Opérateur vide
    };
    
    console.log('📤 Test 2 - Opérateur vide:', JSON.stringify(testData2, null, 2));
    
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
    console.log('✅ Réponse opérateur vide:', responseText2);
    
    // Test 3: Avec opérateur null
    const testData3 = {
      operation: 'initiate',
      reference: `NULL${Date.now()}`,
      amount: 100,
      phone: phone,
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User',
      operator: null // Opérateur null
    };
    
    console.log('📤 Test 3 - Opérateur null:', JSON.stringify(testData3, null, 2));
    
    const response3 = await fetch('https://api.noupia.com/pay', {
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
      body: JSON.stringify(testData3)
    });
    
    const responseText3 = await response3.text();
    console.log('✅ Réponse opérateur null:', responseText3);
    
    return NextResponse.json({
      success: true,
      message: 'Tests auto-détection terminés',
      phone: phone,
      tests: [
        {
          name: 'Auto-détection (sans opérateur)',
          data: testData1,
          status: response1.status,
          response: responseText1,
          success: !responseText1.includes('ERROR_UNKNOWN_OPERATOR') && response1.status === 200
        },
        {
          name: 'Opérateur vide',
          data: testData2,
          status: response2.status,
          response: responseText2,
          success: !responseText2.includes('ERROR_UNKNOWN_OPERATOR') && response2.status === 200
        },
        {
          name: 'Opérateur null',
          data: testData3,
          status: response3.status,
          response: responseText3,
          success: !responseText3.includes('ERROR_UNKNOWN_OPERATOR') && response3.status === 200
        }
      ],
      analysis: {
        autoDetectionWorks: !responseText1.includes('ERROR_UNKNOWN_OPERATOR') && response1.status === 200,
        emptyOperatorWorks: !responseText2.includes('ERROR_UNKNOWN_OPERATOR') && response2.status === 200,
        nullOperatorWorks: !responseText3.includes('ERROR_UNKNOWN_OPERATOR') && response3.status === 200
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test auto-détection:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test auto-détection',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 