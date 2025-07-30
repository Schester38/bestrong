import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '237672886348';
    
    console.log('🧪 Test codes d\'opérateurs Noupia spécifiques');
    console.log('📱 Numéro MTN Cameroun:', phone);
    
    // Codes d'opérateurs spécifiques à Noupia (basés sur les pratiques courantes)
    const noupiaOperators = [
      // Codes MTN spécifiques
      'mtn_mobile_money',
      'mtn_momo',
      'mtn_mobile',
      'mtn_money',
      'mtn_cm',
      'mtn_cameroun',
      'mtn_cameroon',
      
      // Codes numériques spécifiques
      '01', // MTN Cameroun
      '1',  // MTN
      '001', // MTN avec zéros
      
      // Codes avec préfixe pays
      'cm_mtn',
      'cm_mtn_momo',
      'cameroon_mtn',
      'cameroun_mtn',
      
      // Codes courts
      'mtn',
      'MTN',
      'Mtn',
      
      // Codes avec underscore
      'mtn_mobile_money_cm',
      'mtn_momo_cm',
      'mtn_cm_mobile',
      
      // Codes alternatifs
      'mobile_money_mtn',
      'momo_mtn',
      'mtn_mobile_money_cameroun'
    ];
    
    const results = [];
    
    for (const operator of noupiaOperators) {
      try {
        console.log(`🔍 Test avec opérateur Noupia: ${operator}`);
        
        const testData = {
          operation: 'initiate',
          reference: `NOUPIA${operator.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`.substring(0, 50),
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User',
          operator: operator
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
        console.log(`✅ Réponse pour ${operator}:`, responseText);
        
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch {
          parsedResponse = { raw: responseText };
        }
        
        const isSuccess = !responseText.includes('ERROR_UNKNOWN_OPERATOR') && 
                         !responseText.includes('INVALID_PARAMETER') &&
                         response.status === 200;
        
        results.push({
          operator: operator,
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          errorType: responseText.includes('ERROR_UNKNOWN_OPERATOR') ? 'UNKNOWN_OPERATOR' :
                   responseText.includes('INVALID_PARAMETER') ? 'INVALID_PARAMETER' : 'OTHER'
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${operator}:`, error);
        results.push({
          operator: operator,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          errorType: 'NETWORK_ERROR'
        });
      }
    }
    
    const workingOperators = results.filter(r => r.success);
    const unknownOperatorErrors = results.filter(r => r.errorType === 'UNKNOWN_OPERATOR');
    const invalidParameterErrors = results.filter(r => r.errorType === 'INVALID_PARAMETER');
    
    return NextResponse.json({
      success: true,
      message: 'Test codes d\'opérateurs Noupia terminé',
      phone: phone,
      operator: 'MTN Cameroun',
      results: results,
      workingOperators: workingOperators.map(w => w.operator),
      summary: {
        total: results.length,
        working: workingOperators.length,
        failed: results.length - workingOperators.length,
        unknownOperatorErrors: unknownOperatorErrors.length,
        invalidParameterErrors: invalidParameterErrors.length
      },
      analysis: {
        bestOperators: workingOperators.map(w => w.operator),
        mostCommonError: unknownOperatorErrors.length > invalidParameterErrors.length ? 'UNKNOWN_OPERATOR' : 'INVALID_PARAMETER',
        recommendation: workingOperators.length > 0 
          ? `✅ Opérateur fonctionnel trouvé: ${workingOperators[0].operator}`
          : '❌ Aucun code d\'opérateur Noupia fonctionnel trouvé. Vérifier la documentation officielle.'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test codes Noupia:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test des codes Noupia',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 