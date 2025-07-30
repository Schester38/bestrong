import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test Orange simple');
    
    const testData = {
      operation: 'initiate',
      reference: `ORANGE${Date.now().toString().slice(-8)}`,
      amount: 100,
      phone: '699486146',
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    console.log('📤 Données Orange:', JSON.stringify(testData, null, 2));
    
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
    console.log('✅ Réponse Orange:', responseText);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = { raw: responseText };
    }
    
    const isSuccess = response.status === 201 && responseText.includes('OPERATION_SUCCESSFUL');
    const detectedOperator = parsedResponse.data?.channel_name || 'Non détecté';
    const ussdCode = parsedResponse.data?.channel_ussd || 'Non spécifié';
    
    return NextResponse.json({
      success: true,
      message: 'Test Orange simple terminé',
      testData: testData,
      status: response.status,
      response: parsedResponse,
      rawResponse: responseText,
      testSuccess: isSuccess,
      detectedOperator: detectedOperator,
      ussdCode: ussdCode,
      error: parsedResponse.message || null,
      analysis: {
        orangeWorks: isSuccess,
        reference: testData.reference,
        referenceLength: testData.reference.length,
        recommendation: isSuccess 
          ? '✅ Orange fonctionne correctement'
          : '❌ Orange ne fonctionne pas'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test Orange simple:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test Orange simple',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 