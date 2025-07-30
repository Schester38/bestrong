import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 Test MTN vs Orange Cameroun');
    
    const tests = [
      {
        name: 'MTN - Auto-détection',
        phone: '672886348',
        operator: undefined,
        description: 'Votre numéro MTN - Auto-détection'
      },
      {
        name: 'MTN - Explicite',
        phone: '672886348',
        operator: 'mtn',
        description: 'Votre numéro MTN - Explicite'
      },
      {
        name: 'Orange - Auto-détection',
        phone: '699486146',
        operator: undefined,
        description: 'Votre numéro Orange - Auto-détection'
      },
      {
        name: 'Orange - Explicite',
        phone: '699486146',
        operator: 'orange',
        description: 'Votre numéro Orange - Explicite'
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`\n🔍 Test: ${test.name}`);
        
        const testData: any = {
          operation: 'initiate',
          reference: `TEST${test.phone}${Date.now().toString().slice(-6)}`,
          amount: 100,
          phone: test.phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User'
        };
        
        if (test.operator) {
          testData.operator = test.operator;
        }
        
        console.log('📤 Données:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('https://api.noupia.com/pay', {
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
          body: JSON.stringify(testData)
        });
        
        const responseText = await response.text();
        console.log('✅ Réponse:', responseText);
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = { raw: responseText };
        }
        
        const isSuccess = response.status === 201 && responseText.includes('OPERATION_SUCCESSFUL');
        const detectedOperator = parsedResponse.data?.channel_name || 'Non détecté';
        const ussdCode = parsedResponse.data?.channel_ussd || 'Non spécifié';
        
        results.push({
          name: test.name,
          description: test.description,
          phone: test.phone,
          operator: test.operator || 'auto',
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          detectedOperator: detectedOperator,
          ussdCode: ussdCode,
          error: parsedResponse.message || null
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${test.name}:`, error);
        results.push({
          name: test.name,
          description: test.description,
          phone: test.phone,
          operator: test.operator || 'auto',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          detectedOperator: 'Erreur',
          ussdCode: 'Erreur'
        });
      }
    }
    
    const mtnTests = results.filter(r => r.phone === '672886348');
    const orangeTests = results.filter(r => r.phone === '699486146');
    const successfulTests = results.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      message: 'Test MTN vs Orange terminé',
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        mtnTests: mtnTests.length,
        orangeTests: orangeTests.length,
        mtnSuccessRate: mtnTests.filter(r => r.success).length / mtnTests.length * 100,
        orangeSuccessRate: orangeTests.filter(r => r.success).length / orangeTests.length * 100,
        comparison: {
          mtnWorks: mtnTests.some(r => r.success),
          orangeWorks: orangeTests.some(r => r.success),
          mtnBetter: mtnTests.filter(r => r.success).length > orangeTests.filter(r => r.success).length
        }
      },
      summary: {
        mtnSupported: mtnTests.some(r => r.success),
        orangeSupported: orangeTests.some(r => r.success),
        recommendation: mtnTests.some(r => r.success) && !orangeTests.some(r => r.success)
          ? '✅ MTN fonctionne, Orange ne fonctionne pas'
          : mtnTests.some(r => r.success) && orangeTests.some(r => r.success)
          ? '✅ MTN et Orange fonctionnent'
          : !mtnTests.some(r => r.success) && orangeTests.some(r => r.success)
          ? '✅ Orange fonctionne, MTN ne fonctionne pas'
          : '❌ Ni MTN ni Orange ne fonctionnent'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test MTN vs Orange:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test MTN vs Orange',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 