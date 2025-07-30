import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '699486146'; // Votre vrai numéro Orange
    
    console.log('🍊 Test avec vrai numéro Orange:', phone);
    
    // Test 1: Auto-détection (sans opérateur)
    const testData1 = {
      operation: 'initiate',
      reference: `REALORANGE${Date.now()}`,
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
    
    // Test 2: Avec opérateur Orange explicite
    const testData2 = {
      operation: 'initiate',
      reference: `REALORANGEOP${Date.now()}`,
      amount: 100,
      phone: phone,
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User',
      operator: 'orange'
    };
    
    console.log('📤 Test 2 - Avec opérateur Orange:', JSON.stringify(testData2, null, 2));
    
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
    console.log('✅ Réponse avec Orange:', responseText2);
    
    // Test 3: Avec différents codes Orange
    const orangeCodes = ['orange', 'ORANGE', 'Orange', '2', '02', '002', 'orange_money', 'orange_mobile_money'];
    const orangeResults = [];
    
    for (const code of orangeCodes) {
      try {
        const testData3 = {
          operation: 'initiate',
          reference: `REALORANGE${code}${Date.now()}`,
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User',
          operator: code
        };
        
        console.log(`📤 Test Orange avec code: ${code}`);
        
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
        console.log(`✅ Réponse pour ${code}:`, responseText3);
        
        let result3;
        try {
          result3 = JSON.parse(responseText3);
        } catch {
          result3 = { raw: responseText3 };
        }
        
        const success3 = response3.status === 201 && responseText3.includes('OPERATION_SUCCESSFUL');
        
        orangeResults.push({
          code: code,
          status: response3.status,
          response: result3,
          rawResponse: responseText3,
          success: success3
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec code ${code}:`, error);
        orangeResults.push({
          code: code,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false
        });
      }
    }
    
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
    
    const workingOrangeCodes = orangeResults.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      message: 'Test avec vrai numéro Orange terminé',
      phone: phone,
      tests: [
        {
          name: 'Auto-détection Orange',
          data: testData1,
          status: response1.status,
          response: result1,
          rawResponse: responseText1,
          success: success1,
          ussdSent: responseText1.includes('channel_ussd') || success1
        },
        {
          name: 'Avec opérateur Orange',
          data: testData2,
          status: response2.status,
          response: result2,
          rawResponse: responseText2,
          success: success2,
          ussdSent: responseText2.includes('channel_ussd') || success2
        }
      ],
      orangeCodes: orangeResults,
      analysis: {
        autoDetectionWorks: success1,
        orangeOperatorWorks: success2,
        workingOrangeCodes: workingOrangeCodes.map(w => w.code),
        ussdReceived: success1 || success2,
        recommendation: success1 || success2 
          ? '✅ Orange Money fonctionne avec votre numéro !'
          : '❌ Orange Money ne fonctionne toujours pas. Vérifier la configuration Noupia.'
      },
      integration: {
        phoneFormat: 'local',
        operator: success1 ? 'auto' : (success2 ? 'orange' : 'unknown'),
        status: success1 || success2 ? 'working' : 'failed'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test vrai Orange:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test avec vrai Orange',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 