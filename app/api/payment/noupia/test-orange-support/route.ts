import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '';
    
    console.log('🍊 Test support Orange Money Noupia');
    
    // Numéros Orange de test (format Cameroun)
    const orangeTestNumbers = [
      '699999999', // Numéro Orange de test
      '699000000', // Autre numéro Orange de test
      '699111111', // Autre numéro Orange de test
      '699222222', // Autre numéro Orange de test
      '699333333', // Autre numéro Orange de test
      userPhone.replace(/\D/g, '').replace(/^237/, '') // Numéro utilisateur si fourni
    ].filter(phone => phone.length >= 9); // Filtrer les numéros valides
    
    const results = [];
    
    for (const phone of orangeTestNumbers) {
      try {
        console.log(`🔍 Test avec numéro Orange: ${phone}`);
        
        const testData = {
          operation: 'initiate',
          reference: `ORANGETEST${phone}${Date.now()}`,
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User'
          // Pas d'opérateur - auto-détection
        };
        
        console.log('📤 Données envoyées:', JSON.stringify(testData, null, 2));
        
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
        console.log(`✅ Réponse pour ${phone}:`, responseText);
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = { raw: responseText };
        }
        
        const isSuccess = response.status === 201 && responseText.includes('OPERATION_SUCCESSFUL');
        const isPaymentInitError = responseText.includes('PAYMENT_INIT_ERROR');
        const isUnknownOperator = responseText.includes('ERROR_UNKNOWN_OPERATOR');
        
        results.push({
          phone: phone,
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          errorType: isPaymentInitError ? 'PAYMENT_INIT_ERROR' :
                   isUnknownOperator ? 'UNKNOWN_OPERATOR' : 'OTHER',
          analysis: {
            isOrangeSupported: isSuccess,
            isPaymentInitError: isPaymentInitError,
            isUnknownOperator: isUnknownOperator,
            isNetworkError: responseText.includes('fetch failed')
          }
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${phone}:`, error);
        results.push({
          phone: phone,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          errorType: 'NETWORK_ERROR',
          analysis: {
            isOrangeSupported: false,
            isPaymentInitError: false,
            isUnknownOperator: false,
            isNetworkError: true
          }
        });
      }
    }
    
    const successfulTests = results.filter(r => r.success);
    const paymentInitErrors = results.filter(r => r.errorType === 'PAYMENT_INIT_ERROR');
    const unknownOperatorErrors = results.filter(r => r.errorType === 'UNKNOWN_OPERATOR');
    const networkErrors = results.filter(r => r.errorType === 'NETWORK_ERROR');
    
    return NextResponse.json({
      success: true,
      message: 'Test support Orange Money terminé',
      userPhone: userPhone,
      testNumbers: orangeTestNumbers,
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        paymentInitErrors: paymentInitErrors.length,
        unknownOperatorErrors: unknownOperatorErrors.length,
        networkErrors: networkErrors.length,
        orangeSupported: successfulTests.length > 0,
        recommendation: successfulTests.length > 0 
          ? `✅ Orange Money est supporté ! Numéro fonctionnel: ${successfulTests[0].phone}`
          : paymentInitErrors.length > 0
          ? '❌ Orange Money n\'est pas supporté par Noupia (PAYMENT_INIT_ERROR)'
          : unknownOperatorErrors.length > 0
          ? '❌ Orange Money n\'est pas reconnu par Noupia (UNKNOWN_OPERATOR)'
          : '❌ Problème de connectivité ou Orange Money non supporté'
      },
      summary: {
        orangeMoneySupported: successfulTests.length > 0,
        workingNumbers: successfulTests.map(s => s.phone),
        errorPattern: paymentInitErrors.length > 0 ? 'PAYMENT_INIT_ERROR' :
                    unknownOperatorErrors.length > 0 ? 'UNKNOWN_OPERATOR' : 'NETWORK_ERROR'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test support Orange:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test support Orange',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 