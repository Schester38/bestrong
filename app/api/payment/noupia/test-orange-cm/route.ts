import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '699486146'; // Votre numéro Orange
    
    console.log('🍊 Test Orange Money Cameroun');
    console.log('📱 Numéro de test:', userPhone);
    
    const results = [];
    
    // Test 1: Auto-détection (sans opérateur)
    try {
      console.log('🔄 Test 1: Auto-détection...');
      
      const autoTestData = {
        operation: 'initiate',
        reference: `ORANGE_AUTO_${Date.now()}`,
        amount: 100,
        phone: userPhone,
        method: 'mobilemoney',
        country: 'CM',
        currency: 'XAF',
        email: 'test@example.com',
        name: 'Test User'
        // Pas d'opérateur - auto-détection
      };
      
      console.log('📤 Données auto-détection:', JSON.stringify(autoTestData, null, 2));
      
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
      
      results.push({
        test: 'auto-detection',
        status: autoResponse.status,
        response: autoParsedResponse,
        rawResponse: autoResponseText,
        success: autoSuccess,
        operator: 'auto',
        ussd: autoParsedResponse.data?.channel_ussd || 'Non spécifié',
        channel: autoParsedResponse.data?.channel_name || 'Non spécifié'
      });
      
    } catch (error) {
      console.error('❌ Erreur auto-détection:', error);
      results.push({
        test: 'auto-detection',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false,
        operator: 'auto'
      });
    }
    
    // Test 2: Orange explicite
    try {
      console.log('🔄 Test 2: Orange explicite...');
      
      const orangeTestData = {
        operation: 'initiate',
        reference: `ORANGE_EXPLICIT_${Date.now()}`,
        amount: 100,
        phone: userPhone,
        method: 'mobilemoney',
        country: 'CM',
        currency: 'XAF',
        operator: 'orange',
        email: 'test@example.com',
        name: 'Test User'
      };
      
      console.log('📤 Données Orange explicite:', JSON.stringify(orangeTestData, null, 2));
      
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
        test: 'explicit-orange',
        status: orangeResponse.status,
        response: orangeParsedResponse,
        rawResponse: orangeResponseText,
        success: orangeSuccess,
        operator: 'orange',
        ussd: orangeParsedResponse.data?.channel_ussd || 'Non spécifié',
        channel: orangeParsedResponse.data?.channel_name || 'Non spécifié'
      });
      
    } catch (error) {
      console.error('❌ Erreur Orange explicite:', error);
      results.push({
        test: 'explicit-orange',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false,
        operator: 'orange'
      });
    }
    
    // Test 3: Différents codes Orange
    const orangeCodes = ['orange', 'ORANGE', 'Orange Money', 'orange_money'];
    
    for (const code of orangeCodes) {
      try {
        console.log(`🔄 Test 3: Code Orange "${code}"...`);
        
        const codeTestData = {
          operation: 'initiate',
          reference: `ORANGE_${code.toUpperCase()}_${Date.now()}`,
          amount: 100,
          phone: userPhone,
          method: 'mobilemoney',
          country: 'CM',
          currency: 'XAF',
          operator: code,
          email: 'test@example.com',
          name: 'Test User'
        };
        
        const codeResponse = await fetch('https://api.noupia.com/pay', {
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
          body: JSON.stringify(codeTestData)
        });
        
        const codeResponseText = await codeResponse.text();
        console.log(`✅ Réponse "${code}":`, codeResponseText);
        
        let codeParsedResponse;
        try {
          codeParsedResponse = JSON.parse(codeResponseText);
        } catch {
          codeParsedResponse = { raw: codeResponseText };
        }
        
        const codeSuccess = codeResponse.status === 201 && codeResponseText.includes('OPERATION_SUCCESSFUL');
        
        results.push({
          test: `orange-code-${code}`,
          status: codeResponse.status,
          response: codeParsedResponse,
          rawResponse: codeResponseText,
          success: codeSuccess,
          operator: code,
          ussd: codeParsedResponse.data?.channel_ussd || 'Non spécifié',
          channel: codeParsedResponse.data?.channel_name || 'Non spécifié'
        });
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Erreur code "${code}":`, error);
        results.push({
          test: `orange-code-${code}`,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          operator: code
        });
      }
    }
    
    const successfulTests = results.filter(r => r.success);
    const autoDetectionWorks = results.find(r => r.test === 'auto-detection' && r.success)?.success || false;
    const explicitOrangeWorks = results.find(r => r.test === 'explicit-orange' && r.success)?.success || false;
    
    return NextResponse.json({
      success: true,
      message: 'Test Orange Money Cameroun terminé',
      userPhone: userPhone,
      results: results,
      analysis: {
        totalTests: results.length,
        successfulTests: successfulTests.length,
        autoDetectionWorks: autoDetectionWorks,
        explicitOrangeWorks: explicitOrangeWorks,
        workingCodes: successfulTests.map(s => s.operator),
        ussdCodes: successfulTests.map(s => ({ operator: s.operator, ussd: s.ussd, channel: s.channel })),
        recommendation: successfulTests.length > 0 
          ? `✅ Orange Money fonctionne avec ${successfulTests.length} tests réussis`
          : '❌ Orange Money ne fonctionne pas dans les tests'
      },
      summary: {
        orangeSupported: successfulTests.length > 0,
        bestMethod: autoDetectionWorks ? 'auto-detection' : 
                   explicitOrangeWorks ? 'explicit-orange' : 'none',
        ussdCode: successfulTests.find(s => s.ussd && s.ussd !== 'Non spécifié')?.ussd || '#150#',
        channelName: successfulTests.find(s => s.channel && s.channel !== 'Non spécifié')?.channel || 'Orange Money'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test Orange CM:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test Orange Money Cameroun',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 