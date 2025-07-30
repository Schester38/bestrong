import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '699486146'; // Votre numéro Orange
    
    console.log('🔍 Test auto-détection avec différents numéros');
    console.log('📱 Numéro de test:', userPhone);
    
    // Différents numéros de test
    const testNumbers = [
      { phone: '672886348', operator: 'MTN', description: 'Votre numéro MTN' },
      { phone: '699486146', operator: 'Orange', description: 'Votre numéro Orange' },
      { phone: '650123456', operator: 'Orange', description: 'Numéro Orange test' },
      { phone: '680123456', operator: 'MTN', description: 'Numéro MTN test' },
      { phone: '690123456', operator: 'Orange', description: 'Numéro Orange test' },
      { phone: '670123456', operator: 'MTN', description: 'Numéro MTN test' }
    ];
    
    const results = [];
    
    for (const testNumber of testNumbers) {
      try {
        console.log(`\n🔍 Test auto-détection avec ${testNumber.phone} (${testNumber.description})`);
        
        const testData = {
          operation: 'initiate',
          reference: `AUTO${testNumber.phone}${Date.now().toString().slice(-6)}`,
          amount: 100,
          phone: testNumber.phone,
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
        console.log(`✅ Réponse pour ${testNumber.phone}:`, responseText);
        
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
          phone: testNumber.phone,
          expectedOperator: testNumber.operator,
          description: testNumber.description,
          status: response.status,
          response: parsedResponse,
          rawResponse: responseText,
          success: isSuccess,
          detectedOperator: detectedOperator,
          ussdCode: ussdCode,
          autoDetectionCorrect: detectedOperator.toLowerCase().includes(testNumber.operator.toLowerCase())
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${testNumber.phone}:`, error);
        results.push({
          phone: testNumber.phone,
          expectedOperator: testNumber.operator,
          description: testNumber.description,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          detectedOperator: 'Erreur',
          ussdCode: 'Erreur',
          autoDetectionCorrect: false
        });
      }
    }
    
    const successfulTests = results.filter(r => r.success);
    const correctDetections = results.filter(r => r.autoDetectionCorrect);
    const mtnNumbers = results.filter(r => r.expectedOperator === 'MTN');
    const orangeNumbers = results.filter(r => r.expectedOperator === 'Orange');
    
    return NextResponse.json({
      success: true,
      message: 'Test auto-détection terminé',
      userPhone: userPhone,
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        correctDetections: correctDetections.length,
        mtnTests: mtnNumbers.length,
        orangeTests: orangeNumbers.length,
        mtnSuccessRate: mtnNumbers.filter(r => r.success).length / mtnNumbers.length * 100,
        orangeSuccessRate: orangeNumbers.filter(r => r.success).length / orangeNumbers.length * 100,
        autoDetectionAccuracy: correctDetections.length / successfulTests.length * 100,
        recommendation: correctDetections.length > 0 
          ? `✅ Auto-détection fonctionne pour ${correctDetections.length}/${successfulTests.length} tests`
          : '❌ Auto-détection ne fonctionne pas correctement'
      },
      summary: {
        autoDetectionWorks: correctDetections.length > 0,
        bestDetectedOperator: successfulTests.length > 0 ? 
          successfulTests.reduce((prev, current) => 
            (current.autoDetectionCorrect ? 1 : 0) > (prev.autoDetectionCorrect ? 1 : 0) ? current : prev
          ).detectedOperator : 'Aucun',
        ussdCodes: successfulTests.map(s => ({ phone: s.phone, ussd: s.ussdCode, operator: s.detectedOperator })),
        issues: results.filter(r => !r.autoDetectionCorrect && r.success).map(r => ({
          phone: r.phone,
          expected: r.expectedOperator,
          detected: r.detectedOperator
        }))
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