import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '699486146'; // Votre vrai numéro Orange
    
    console.log('🍊 Test Orange Money avec code exact');
    console.log('📱 Numéro Orange:', phone);
    
    // Test avec le code exact "Orange Money"
    const orangeMoneyCodes = [
      'Orange Money',
      'ORANGE MONEY',
      'orange money',
      'OrangeMoney',
      'ORANGEMONEY',
      'orange_money',
      'orange-money',
      'orange.money',
      'orangemoney'
    ];
    
    const results = [];
    
    for (const code of orangeMoneyCodes) {
      try {
        console.log(`🔍 Test avec code: "${code}"`);
        
        // Référence courte pour éviter INVALID_PARAMETER
        const shortReference = `OM${Date.now()}`.substring(0, 20);
        
        const testData = {
          operation: 'initiate',
          reference: shortReference,
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User',
          operator: code
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
        console.log(`✅ Réponse pour "${code}":`, responseText);
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = { raw: responseText };
        }
        
        const isSuccess = response.status === 201 && responseText.includes('OPERATION_SUCCESSFUL');
        const isPaymentInitError = responseText.includes('PAYMENT_INIT_ERROR');
        const isInvalidParameter = responseText.includes('INVALID_PARAMETER');
        const isUnknownOperator = responseText.includes('ERROR_UNKNOWN_OPERATOR');
        
        results.push({
          code: code,
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          errorType: isPaymentInitError ? 'PAYMENT_INIT_ERROR' :
                   isInvalidParameter ? 'INVALID_PARAMETER' :
                   isUnknownOperator ? 'UNKNOWN_OPERATOR' : 'OTHER',
          analysis: {
            isOrangeMoneySupported: isSuccess,
            isPaymentInitError: isPaymentInitError,
            isInvalidParameter: isInvalidParameter,
            isUnknownOperator: isUnknownOperator,
            isNetworkError: responseText.includes('fetch failed')
          }
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec code "${code}":`, error);
        results.push({
          code: code,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          errorType: 'NETWORK_ERROR',
          analysis: {
            isOrangeMoneySupported: false,
            isPaymentInitError: false,
            isInvalidParameter: false,
            isUnknownOperator: false,
            isNetworkError: true
          }
        });
      }
    }
    
    const successfulTests = results.filter(r => r.success);
    const paymentInitErrors = results.filter(r => r.errorType === 'PAYMENT_INIT_ERROR');
    const invalidParameterErrors = results.filter(r => r.errorType === 'INVALID_PARAMETER');
    const unknownOperatorErrors = results.filter(r => r.errorType === 'UNKNOWN_OPERATOR');
    
    return NextResponse.json({
      success: true,
      message: 'Test Orange Money avec codes exacts terminé',
      phone: phone,
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        paymentInitErrors: paymentInitErrors.length,
        invalidParameterErrors: invalidParameterErrors.length,
        unknownOperatorErrors: unknownOperatorErrors.length,
        orangeMoneySupported: successfulTests.length > 0,
        recommendation: successfulTests.length > 0 
          ? `✅ Orange Money fonctionne ! Code: "${successfulTests[0].code}"`
          : invalidParameterErrors.length > 0
          ? '🔍 Orange Money pourrait être supporté (INVALID_PARAMETER) - essayer d\'autres formats'
          : paymentInitErrors.length > 0
          ? '❌ Orange Money n\'est pas supporté par Noupia (PAYMENT_INIT_ERROR)'
          : '❌ Orange Money n\'est pas reconnu par Noupia (UNKNOWN_OPERATOR)'
      },
      summary: {
        orangeMoneySupported: successfulTests.length > 0,
        workingCodes: successfulTests.map(s => s.code),
        errorPattern: paymentInitErrors.length > 0 ? 'PAYMENT_INIT_ERROR' :
                    invalidParameterErrors.length > 0 ? 'INVALID_PARAMETER' :
                    unknownOperatorErrors.length > 0 ? 'UNKNOWN_OPERATOR' : 'NETWORK_ERROR'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test Orange Money:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test Orange Money',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 