import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '672886348'; // Numéro de test
    
    console.log('🌍 Test MTN dans différents pays');
    console.log('📱 Numéro de test:', userPhone);
    
    // Pays avec MTN et leurs codes pays
    const mtnCountries = [
      { country: 'CM', name: 'Cameroun', phone: '672886348', currency: 'XAF' },
      { country: 'NG', name: 'Nigeria', phone: '8031234567', currency: 'NGN' },
      { country: 'GH', name: 'Ghana', phone: '244123456', currency: 'GHS' },
      { country: 'UG', name: 'Ouganda', phone: '771234567', currency: 'UGX' },
      { country: 'RW', name: 'Rwanda', phone: '781234567', currency: 'RWF' },
      { country: 'TZ', name: 'Tanzanie', phone: '712345678', currency: 'TZS' },
      { country: 'ZM', name: 'Zambie', phone: '955123456', currency: 'ZMW' },
      { country: 'MW', name: 'Malawi', phone: '881234567', currency: 'MWK' },
      { country: 'BW', name: 'Botswana', phone: '71123456', currency: 'BWP' },
      { country: 'SZ', name: 'Eswatini', phone: '76123456', currency: 'SZL' },
      { country: 'LS', name: 'Lesotho', phone: '58123456', currency: 'LSL' },
      { country: 'SS', name: 'Soudan du Sud', phone: '911234567', currency: 'SSP' },
      { country: 'CF', name: 'République Centrafricaine', phone: '72123456', currency: 'XAF' },
      { country: 'TD', name: 'Tchad', phone: '66123456', currency: 'XAF' },
      { country: 'GQ', name: 'Guinée équatoriale', phone: '55123456', currency: 'XAF' },
      { country: 'GA', name: 'Gabon', phone: '06123456', currency: 'XAF' },
      { country: 'CG', name: 'Congo', phone: '06123456', currency: 'XAF' },
      { country: 'CD', name: 'RDC', phone: '891234567', currency: 'CDF' },
      { country: 'AO', name: 'Angola', phone: '923123456', currency: 'AOA' },
      { country: 'MZ', name: 'Mozambique', phone: '821234567', currency: 'MZN' },
      { country: 'NA', name: 'Namibie', phone: '811234567', currency: 'NAD' },
      { country: 'ZW', name: 'Zimbabwe', phone: '771234567', currency: 'ZWL' },
      { country: 'KE', name: 'Kenya', phone: '712345678', currency: 'KES' },
      { country: 'ET', name: 'Éthiopie', phone: '911234567', currency: 'ETB' },
      { country: 'SO', name: 'Somalie', phone: '611234567', currency: 'SOS' },
      { country: 'DJ', name: 'Djibouti', phone: '77123456', currency: 'DJF' },
      { country: 'ER', name: 'Érythrée', phone: '71123456', currency: 'ERN' },
      { country: 'SD', name: 'Soudan', phone: '911234567', currency: 'SDG' },
      { country: 'EG', name: 'Égypte', phone: '1012345678', currency: 'EGP' },
      { country: 'LY', name: 'Libye', phone: '911234567', currency: 'LYD' },
      { country: 'TN', name: 'Tunisie', phone: '20123456', currency: 'TND' },
      { country: 'DZ', name: 'Algérie', phone: '551234567', currency: 'DZD' },
      { country: 'MA', name: 'Maroc', phone: '612345678', currency: 'MAD' },
      { country: 'CI', name: 'Côte d\'Ivoire', phone: '07123456', currency: 'XOF' },
      { country: 'BF', name: 'Burkina Faso', phone: '70123456', currency: 'XOF' },
      { country: 'ML', name: 'Mali', phone: '70123456', currency: 'XOF' },
      { country: 'NE', name: 'Niger', phone: '90123456', currency: 'XOF' },
      { country: 'SN', name: 'Sénégal', phone: '771234567', currency: 'XOF' },
      { country: 'GN', name: 'Guinée', phone: '621234567', currency: 'GNF' },
      { country: 'SL', name: 'Sierra Leone', phone: '76123456', currency: 'SLL' },
      { country: 'LR', name: 'Libéria', phone: '771234567', currency: 'LRD' },
      { country: 'TG', name: 'Togo', phone: '90123456', currency: 'XOF' },
      { country: 'BJ', name: 'Bénin', phone: '90123456', currency: 'XOF' },
      { country: 'GW', name: 'Guinée-Bissau', phone: '551234567', currency: 'XOF' },
      { country: 'CV', name: 'Cap-Vert', phone: '9912345', currency: 'CVE' },
      { country: 'GM', name: 'Gambie', phone: '7012345', currency: 'GMD' },
      { country: 'MR', name: 'Mauritanie', phone: '22123456', currency: 'MRU' }
    ];
    
    const results = [];
    
    for (const country of mtnCountries) {
      try {
        console.log(`🔍 Test MTN ${country.name} (${country.country})`);
        
        const testData = {
          operation: 'initiate',
          reference: `MTN${country.country}${Date.now()}`,
          amount: 100,
          phone: country.phone,
          method: 'mobilemoney',
          country: country.country,
          currency: country.currency,
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
        console.log(`✅ Réponse pour ${country.name}:`, responseText);
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = { raw: responseText };
        }
        
        const isSuccess = response.status === 201 && responseText.includes('OPERATION_SUCCESSFUL');
        const isPaymentInitError = responseText.includes('PAYMENT_INIT_ERROR');
        const isUnknownOperator = responseText.includes('ERROR_UNKNOWN_OPERATOR');
        const isInvalidParameter = responseText.includes('INVALID_PARAMETER');
        
        results.push({
          country: country.country,
          name: country.name,
          phone: country.phone,
          currency: country.currency,
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          errorType: isPaymentInitError ? 'PAYMENT_INIT_ERROR' :
                   isUnknownOperator ? 'UNKNOWN_OPERATOR' :
                   isInvalidParameter ? 'INVALID_PARAMETER' : 'OTHER',
          analysis: {
            isMtnSupported: isSuccess,
            isPaymentInitError: isPaymentInitError,
            isUnknownOperator: isUnknownOperator,
            isInvalidParameter: isInvalidParameter,
            isNetworkError: responseText.includes('fetch failed')
          }
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${country.name}:`, error);
        results.push({
          country: country.country,
          name: country.name,
          phone: country.phone,
          currency: country.currency,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          errorType: 'NETWORK_ERROR',
          analysis: {
            isMtnSupported: false,
            isPaymentInitError: false,
            isUnknownOperator: false,
            isInvalidParameter: false,
            isNetworkError: true
          }
        });
      }
    }
    
    const successfulTests = results.filter(r => r.success);
    const paymentInitErrors = results.filter(r => r.errorType === 'PAYMENT_INIT_ERROR');
    const unknownOperatorErrors = results.filter(r => r.errorType === 'UNKNOWN_OPERATOR');
    const invalidParameterErrors = results.filter(r => r.errorType === 'INVALID_PARAMETER');
    
    return NextResponse.json({
      success: true,
      message: 'Test MTN dans différents pays terminé',
      userPhone: userPhone,
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        paymentInitErrors: paymentInitErrors.length,
        unknownOperatorErrors: unknownOperatorErrors.length,
        invalidParameterErrors: invalidParameterErrors.length,
        supportedCountries: successfulTests.map(s => ({ country: s.country, name: s.name })),
        recommendation: successfulTests.length > 0 
          ? `✅ MTN supporté dans ${successfulTests.length} pays : ${successfulTests.map(s => s.name).join(', ')}`
          : '❌ MTN non supporté dans les pays testés'
      },
      summary: {
        mtnSupportedCountries: successfulTests.length,
        workingCountries: successfulTests.map(s => ({ country: s.country, name: s.name, phone: s.phone })),
        errorPattern: paymentInitErrors.length > 0 ? 'PAYMENT_INIT_ERROR' :
                    unknownOperatorErrors.length > 0 ? 'UNKNOWN_OPERATOR' :
                    invalidParameterErrors.length > 0 ? 'INVALID_PARAMETER' : 'NETWORK_ERROR'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test pays MTN:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test des pays MTN',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 