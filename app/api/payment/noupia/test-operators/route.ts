import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '237672886348';
    
    console.log('🧪 Test des opérateurs pour le numéro:', phone);
    
    // Différents formats d'opérateurs à tester
    const operators = [
      'AUTO_DETECT', // Test sans opérateur
      'MTN',
      'mtn',
      'MTN_MOBILE_MONEY',
      'mtn_mobile_money',
      'MTN_MOMO',
      'mtn_momo',
      'MTN_MOBILE',
      'mtn_mobile',
      'ORANGE',
      'orange',
      'ORANGE_MONEY',
      'orange_money',
      'MOOV',
      'moov',
      'MOOV_MONEY',
      'moov_money'
    ];
    
    const results = [];
    
    for (const operator of operators) {
      try {
        console.log(`🔍 Test avec opérateur: ${operator}`);
        
        const testData: any = {
          operation: 'initiate',
          reference: `TEST${operator.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`, // Nettoyer la référence
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User'
        };

        // Ajouter l'opérateur seulement si ce n'est pas AUTO_DETECT
        if (operator !== 'AUTO_DETECT') {
          testData.operator = operator;
        }
        
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
        
        results.push({
          operator: operator,
          status: response.status,
          response: responseText,
          success: !responseText.includes('ERROR_UNKNOWN_OPERATOR')
        });
        
        // Attendre un peu entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${operator}:`, error);
        results.push({
          operator: operator,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false
        });
      }
    }
    
    // Trouver les opérateurs qui fonctionnent
    const workingOperators = results.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      message: 'Test des opérateurs terminé',
      phone: phone,
      results: results,
      workingOperators: workingOperators.map(w => w.operator),
      summary: {
        total: results.length,
        working: workingOperators.length,
        failed: results.length - workingOperators.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test des opérateurs',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 