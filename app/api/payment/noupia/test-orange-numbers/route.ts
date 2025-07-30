import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '699486146';
    
    console.log('🍊 Test différents numéros Orange');
    console.log('📱 Numéro de test:', userPhone);
    
    // Différents numéros Orange de test
    const orangeNumbers = [
      { phone: '699486146', description: 'Votre numéro Orange' },
      { phone: '650123456', description: 'Numéro Orange test 1' },
      { phone: '651234567', description: 'Numéro Orange test 2' },
      { phone: '690123456', description: 'Numéro Orange test 3' },
      { phone: '691234567', description: 'Numéro Orange test 4' },
      { phone: '692345678', description: 'Numéro Orange test 5' }
    ];
    
    const results = [];
    
    for (const orangeNumber of orangeNumbers) {
      try {
        console.log(`\n🔍 Test Orange ${orangeNumber.phone} (${orangeNumber.description})`);
        
        // Test 1: Auto-détection
        const autoTestData = {
          operation: 'initiate',
          reference: `OA${orangeNumber.phone}${Date.now().toString().slice(-6)}`,
          amount: 100,
          phone: orangeNumber.phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          email: 'test@example.com',
          name: 'Test User'
          // Pas d'opérateur - auto-détection
        };
        
        console.log('📤 Test auto-détection...');
        
        const autoResponse = await fetch('https://api.noupia.com/pay', {
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
          body: JSON.stringify(autoTestData)
        });
        
        const autoResponseText = await autoResponse.text();
        console.log('✅ Réponse auto-détection:', autoResponseText);
        
        let autoParsedResponse;
        try {
          autoParsedResponse = JSON.parse(autoResponseText);
        } catch {
          autoParsedResponse = { raw: autoResponseText };
        }
        
        const autoSuccess = autoResponse.status === 201 && autoResponseText.includes('OPERATION_SUCCESSFUL');
        
        // Test 2: Orange explicite
        const orangeTestData = {
          operation: 'initiate',
          reference: `OE${orangeNumber.phone}${Date.now().toString().slice(-6)}`,
          amount: 100,
          phone: orangeNumber.phone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          operator: 'orange',
          email: 'test@example.com',
          name: 'Test User'
        };
        
        console.log('📤 Test Orange explicite...');
        
        const orangeResponse = await fetch('https://api.noupia.com/pay', {
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
          body: JSON.stringify(orangeTestData)
        });
        
        const orangeResponseText = await orangeResponse.text();
        console.log('✅ Réponse Orange explicite:', orangeResponseText);
        
        let orangeParsedResponse;
        try {
          orangeParsedResponse = JSON.parse(orangeResponseText);
        } catch {
          orangeParsedResponse = { raw: orangeResponseText };
        }
        
        const orangeSuccess = orangeResponse.status === 201 && orangeResponseText.includes('OPERATION_SUCCESSFUL');
        
        results.push({
          phone: orangeNumber.phone,
          description: orangeNumber.description,
          autoDetection: {
            success: autoSuccess,
            status: autoResponse.status,
            response: autoParsedResponse,
            rawResponse: autoResponseText
          },
          explicitOrange: {
            success: orangeSuccess,
            status: orangeResponse.status,
            response: orangeParsedResponse,
            rawResponse: orangeResponseText
          },
          summary: {
            autoWorks: autoSuccess,
            explicitWorks: orangeSuccess,
            anyWorks: autoSuccess || orangeSuccess
          }
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur avec ${orangeNumber.phone}:`, error);
        results.push({
          phone: orangeNumber.phone,
          description: orangeNumber.description,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          autoDetection: { success: false, error: true },
          explicitOrange: { success: false, error: true },
          summary: {
            autoWorks: false,
            explicitWorks: false,
            anyWorks: false
          }
        });
      }
    }
    
    const workingNumbers = results.filter(r => r.summary.anyWorks);
    const autoWorkingNumbers = results.filter(r => r.summary.autoWorks);
    const explicitWorkingNumbers = results.filter(r => r.summary.explicitWorks);
    
    return NextResponse.json({
      success: true,
      message: 'Test numéros Orange terminé',
      userPhone: userPhone,
      results: results,
      analysis: {
        totalNumbers: results.length,
        workingNumbers: workingNumbers.length,
        autoWorkingNumbers: autoWorkingNumbers.length,
        explicitWorkingNumbers: explicitWorkingNumbers.length,
        successRate: workingNumbers.length / results.length * 100,
        autoSuccessRate: autoWorkingNumbers.length / results.length * 100,
        explicitSuccessRate: explicitWorkingNumbers.length / results.length * 100,
        recommendation: workingNumbers.length > 0 
          ? `✅ Orange fonctionne avec ${workingNumbers.length}/${results.length} numéros`
          : '❌ Orange ne fonctionne avec aucun numéro testé'
      },
      summary: {
        orangeSupported: workingNumbers.length > 0,
        bestMethod: autoWorkingNumbers.length > 0 ? 'auto-detection' : 
                   explicitWorkingNumbers.length > 0 ? 'explicit-orange' : 'none',
        workingNumbers: workingNumbers.map(w => ({
          phone: w.phone,
          description: w.description,
          autoWorks: w.summary.autoWorks,
          explicitWorks: w.summary.explicitWorks
        })),
        issues: results.filter(r => !r.summary.anyWorks).map(r => ({
          phone: r.phone,
          description: r.description,
          autoError: r.autoDetection.response?.message || 'Erreur inconnue',
          explicitError: r.explicitOrange.response?.message || 'Erreur inconnue'
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test numéros Orange:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test des numéros Orange',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 