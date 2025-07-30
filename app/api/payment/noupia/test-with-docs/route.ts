import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone || '237672886348';
    
    console.log('🧪 Test avec codes d\'opérateurs Noupia pour le numéro:', phone);
    
    // Codes d'opérateurs courants pour Noupia - MTN Cameroun en priorité
    const operators = [
      // MTN Cameroun - formats prioritaires
      'MTN',
      'mtn',
      'MTN_MOBILE_MONEY',
      'MTN-MOBILE-MONEY',
      'MTN_MOMO',
      'MTN_MOBILE',
      'MTN_MONEY',
      
      // Codes numériques MTN
      '1',
      '01',
      
      // Auto-détection
      'AUTO_DETECT',
      'AUTO',
      '',
      
      // Autres opérateurs (pour comparaison)
      'ORANGE',
      'orange',
      'ORANGE_MONEY',
      'ORANGE-MONEY',
      '2',
      '02',
      
      'MOOV',
      'moov',
      'MOOV_MONEY',
      'MOOV-MONEY',
      '3',
      '03'
    ];
    
    const results = [];
    
    for (const operator of operators) {
      try {
        console.log(`🔍 Test avec opérateur: ${operator}`);
        
        const testData: any = {
          operation: 'initiate',
          reference: `TEST${operator}${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50),
          amount: 100,
          phone: phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User'
        };
        
        // Ajouter l'opérateur seulement si ce n'est pas AUTO_DETECT ou vide
        if (operator && operator !== 'AUTO_DETECT' && operator !== 'AUTO' && operator !== '') {
          testData.operator = operator;
        }
        
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
    
    // Analyse spécifique pour MTN Cameroun
    const mtnOperators = results.filter(r => 
      r.operator && (
        r.operator.toLowerCase().includes('mtn') || 
        r.operator === '1' || 
        r.operator === '01'
      )
    );
    const workingMtnOperators = mtnOperators.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      message: 'Test avec codes d\'opérateurs Noupia terminé',
      phone: phone,
      operator: 'MTN Cameroun',
      results: results,
      workingOperators: workingOperators.map(w => w.operator),
      mtnAnalysis: {
        totalMtnTests: mtnOperators.length,
        workingMtnOperators: workingMtnOperators.map(w => w.operator),
        failedMtnOperators: mtnOperators.filter(r => !r.success).map(w => w.operator),
        bestMtnOperator: workingMtnOperators.length > 0 ? workingMtnOperators[0].operator : null
      },
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
        recommendation: workingMtnOperators.length > 0 ? 
          `✅ MTN Cameroun fonctionne avec: ${workingMtnOperators[0].operator}` : 
          workingOperators.length > 0 ? 
          `⚠️ MTN ne fonctionne pas, mais ${workingOperators[0].operator} fonctionne` :
          '❌ Aucun opérateur fonctionnel trouvé. Vérifier la documentation Noupia.'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test avec codes d\'opérateurs',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 