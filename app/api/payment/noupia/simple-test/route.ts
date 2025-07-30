import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEST ENDPOINT ===');
    
    // Test 1: Vérifier que l'endpoint fonctionne
    console.log('✅ Endpoint accessible');
    
    // Test 2: Vérifier le body de la requête
    const body = await request.json();
    console.log('✅ Body reçu:', body);
    
    // Test 3: Test de connectivité simple
    try {
      console.log('🔍 Test de connectivité à api.noupia.com...');
      const testResponse = await fetch('https://api.noupia.com', {
        method: 'GET',
        headers: {
          'User-Agent': 'BE-STRONG-APP/1.0'
        }
      });
      console.log('✅ Connectivité OK:', testResponse.status, testResponse.statusText);
    } catch (connectError) {
      console.error('❌ Erreur de connectivité:', connectError);
    }
    
    // Test 4: Test avec des données minimales
    const testData = {
      operation: 'initiate',
      reference: 'TEST123',
      amount: 100,
      phone: body.phone || 237612345678, // Utiliser le numéro envoyé ou un numéro par défaut
      method: 'mobilemoney',
      operator: 'mtn_mobile_money', // Essayer avec un autre format
      country: 'CM',
      currency: 'XAF',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    console.log('🔍 Test avec données minimales:', testData);
    console.log('🔑 Clés API utilisées:');
    console.log('  - Developer Key:', process.env.NOUPIA_DEVELOPER_KEY ? 'PRÉSENTE' : 'MANQUANTE');
    console.log('  - Subscription Key:', process.env.NOUPIA_SUBSCRIPTION_KEY ? 'PRÉSENTE' : 'MANQUANTE');
    console.log('  - Developer Key (début):', process.env.NOUPIA_DEVELOPER_KEY?.substring(0, 20) + '...');
    console.log('  - Subscription Key (début):', process.env.NOUPIA_SUBSCRIPTION_KEY?.substring(0, 20) + '...');
    
    try {
      const response = await fetch('https://api.noupia.com/pay', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'User-Agent': 'BE-STRONG-APP/1.0',
          'Noupia-API-Signature': 'np-live',
          'Noupia-API-Key': process.env.NOUPIA_DEVELOPER_KEY || 'test-key',
          'Noupia-Product-Key': process.env.NOUPIA_SUBSCRIPTION_KEY || 'test-key',
          'Noupia-API-Version': '1.0',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(testData)
      });
      
      console.log('✅ Réponse reçue:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('✅ Texte de réponse:', responseText);
      
      return NextResponse.json({
        success: true,
        message: 'Test complet effectué',
        connectivity: 'OK',
        apiResponse: {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        }
      });
      
    } catch (apiError) {
      console.error('❌ Erreur API:', apiError);
      return NextResponse.json({
        success: false,
        message: 'Erreur lors de l\'appel API',
        error: apiError instanceof Error ? apiError.message : 'Erreur inconnue'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur générale',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 