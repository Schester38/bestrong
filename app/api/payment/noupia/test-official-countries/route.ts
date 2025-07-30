import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userPhone = body.phone || '672886348';
    
    console.log('🏆 Test des pays officiellement supportés par Noupia');
    console.log('📱 Numéro de test:', userPhone);
    
    // Pays officiellement supportés par Noupia
    const officialCountries = [
      { 
        country: 'CM', 
        name: 'Cameroun', 
        phone: '672886348', 
        currency: 'XAF',
        operators: ['mtn', 'orange', 'moov'],
        description: 'MTN Mobile Money, Orange Money, Moov Money'
      },
      { 
        country: 'SN', 
        name: 'Sénégal', 
        phone: '771234567', 
        currency: 'XOF',
        operators: ['orange', 'free', 'mtn'],
        description: 'Orange Money, Free Money, MTN Mobile Money'
      },
      { 
        country: 'CG', 
        name: 'Congo', 
        phone: '06123456', 
        currency: 'XAF',
        operators: ['mtn', 'airtel'],
        description: 'MTN Mobile Money, Airtel Money'
      },
      { 
        country: 'CI', 
        name: 'Côte d\'Ivoire', 
        phone: '07123456', 
        currency: 'XOF',
        operators: ['mtn', 'moov', 'orange'],
        description: 'MTN Mobile Money, Moov Money, Orange Money'
      },
      { 
        country: 'BJ', 
        name: 'Bénin', 
        phone: '90123456', 
        currency: 'XOF',
        operators: ['mtn', 'moov'],
        description: 'MTN Mobile Money, Moov Money'
      }
    ];
    
    const results = [];
    
    for (const country of officialCountries) {
      console.log(`\n🔍 Test ${country.name} (${country.country})`);
      console.log(`📱 Opérateurs supportés: ${country.description}`);
      
      const countryResults = [];
      
      // Test avec auto-détection (sans opérateur)
      try {
        console.log(`  🔄 Test auto-détection...`);
        
        const autoTestData = {
          operation: 'initiate',
          reference: `AUTO${country.country}${Date.now()}`,
          amount: 100,
          phone: country.phone,
          method: 'mobilemoney',
          country: country.country,
          currency: country.currency,
          email: 'test@example.com',
          name: 'Test User'
          // Pas d'opérateur - auto-détection
        };
        
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
        console.log(`  ✅ Auto-détection: ${autoResponseText.substring(0, 100)}...`);
        
        let autoParsedResponse;
        try {
          autoParsedResponse = JSON.parse(autoResponseText);
        } catch {
          autoParsedResponse = { raw: autoResponseText };
        }
        
        const autoSuccess = autoResponse.status === 201 && autoResponseText.includes('OPERATION_SUCCESSFUL');
        
        countryResults.push({
          test: 'auto-detection',
          status: autoResponse.status,
          response: autoParsedResponse,
          rawResponse: autoResponseText,
          success: autoSuccess,
          operator: 'auto'
        });
        
      } catch (error) {
        console.error(`  ❌ Erreur auto-détection:`, error);
        countryResults.push({
          test: 'auto-detection',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          success: false,
          operator: 'auto'
        });
      }
      
      // Test avec chaque opérateur spécifique
      for (const operator of country.operators) {
        try {
          console.log(`  🔄 Test ${operator}...`);
          
          const operatorTestData = {
            operation: 'initiate',
            reference: `${operator.toUpperCase()}${country.country}${Date.now()}`,
            amount: 100,
            phone: country.phone,
            method: 'mobilemoney',
            country: country.country,
            currency: country.currency,
            operator: operator,
            email: 'test@example.com',
            name: 'Test User'
          };
          
          const operatorResponse = await fetch('https://api.noupia.com/pay', {
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
            body: JSON.stringify(operatorTestData)
          });
          
          const operatorResponseText = await operatorResponse.text();
          console.log(`  ✅ ${operator}: ${operatorResponseText.substring(0, 100)}...`);
          
          let operatorParsedResponse;
          try {
            operatorParsedResponse = JSON.parse(operatorResponseText);
          } catch {
            operatorParsedResponse = { raw: operatorResponseText };
          }
          
          const operatorSuccess = operatorResponse.status === 201 && operatorResponseText.includes('OPERATION_SUCCESSFUL');
          
          countryResults.push({
            test: 'specific-operator',
            status: operatorResponse.status,
            response: operatorParsedResponse,
            rawResponse: operatorResponseText,
            success: operatorSuccess,
            operator: operator
          });
          
        } catch (error) {
          console.error(`  ❌ Erreur ${operator}:`, error);
          countryResults.push({
            test: 'specific-operator',
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            success: false,
            operator: operator
          });
        }
        
        // Attendre entre les tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      results.push({
        country: country.country,
        name: country.name,
        phone: country.phone,
        currency: country.currency,
        operators: country.operators,
        description: country.description,
        results: countryResults,
        summary: {
          totalTests: countryResults.length,
          successfulTests: countryResults.filter(r => r.success).length,
          workingOperators: countryResults.filter(r => r.success).map(r => r.operator),
          autoDetectionWorks: countryResults.find(r => r.test === 'auto-detection' && r.success)?.success || false
        }
      });
      
      // Attendre entre les pays
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const successfulCountries = results.filter(r => r.summary.successfulTests > 0);
    const totalSuccessfulTests = results.reduce((sum, r) => sum + r.summary.successfulTests, 0);
    
    return NextResponse.json({
      success: true,
      message: 'Test des pays officiellement supportés par Noupia terminé',
      userPhone: userPhone,
      officialCountries: officialCountries.map(c => ({ country: c.country, name: c.name, operators: c.operators })),
      results: results,
      analysis: {
        totalCountries: results.length,
        successfulCountries: successfulCountries.length,
        totalSuccessfulTests: totalSuccessfulTests,
        countriesWithWorkingOperators: successfulCountries.map(c => ({
          country: c.country,
          name: c.name,
          workingOperators: c.summary.workingOperators,
          autoDetectionWorks: c.summary.autoDetectionWorks
        })),
        recommendation: successfulCountries.length > 0 
          ? `✅ ${successfulCountries.length}/${results.length} pays fonctionnent : ${successfulCountries.map(c => c.name).join(', ')}`
          : '❌ Aucun pays ne fonctionne dans les tests'
      },
      summary: {
        workingCountries: successfulCountries.length,
        totalOperatorsTested: results.reduce((sum, r) => sum + r.operators.length, 0),
        autoDetectionSuccessRate: results.filter(r => r.summary.autoDetectionWorks).length / results.length * 100,
        bestCountries: successfulCountries
          .sort((a, b) => b.summary.successfulTests - a.summary.successfulTests)
          .slice(0, 3)
          .map(c => ({ country: c.country, name: c.name, operators: c.summary.workingOperators }))
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur test pays officiels:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du test des pays officiels',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 