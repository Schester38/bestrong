import { NextRequest, NextResponse } from 'next/server';

interface TestRequest {
  developerKey: string;
  subscriptionKey: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== NOUPIA TEST START ===');
    
    const body: TestRequest = await request.json();
    console.log('Request body received');

    if (!body.developerKey || !body.subscriptionKey) {
      console.log('Missing keys');
      return NextResponse.json({
        success: false,
        message: 'Clés NOUPIA manquantes'
      }, { status: 400 });
    }

    console.log('Testing NOUPIA connection...');
    console.log('Developer Key length:', body.developerKey.length);
    console.log('Subscription Key length:', body.subscriptionKey.length);

    // Test simple avec l'API NOUPIA
    const testData = {
      operation: 'initiate',
      reference: 'T' + Date.now().toString().slice(-8),
      amount: 100,
      phone: 671234567,
      method: 'mobilemoney',
      country: 'CM',
      currency: 'XAF'
    };

    console.log('Request data:', testData);
    console.log('About to make fetch request...');
    console.log('URL:', 'https://api.noupia.com/pay');

    // Test de connectivité d'abord
    console.log('Testing connectivity...');
    try {
      const connectivityResponse = await fetch('https://api.noupia.com', {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'BE-STRONG-APP/1.0'
        }
      });
      console.log('Connectivity test status:', connectivityResponse.status);
    } catch (connectivityError) {
      console.error('Connectivity test failed:', connectivityError);
    }

    // Test avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes

    try {
      console.log('Making POST request...');
      const response = await fetch('https://api.noupia.com/pay', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'User-Agent': 'BE-STRONG-APP/1.0',
          'Noupia-API-Signature': 'np-live',
          'Noupia-API-Key': body.developerKey,
          'Noupia-Product-Key': body.subscriptionKey,
          'Noupia-API-Version': '1.0',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Response received');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('NOUPIA test response:', result);

      if (result.response === 'success') {
        console.log('=== NOUPIA TEST SUCCESS ===');
        return NextResponse.json({
          success: true,
          message: 'Connexion NOUPIA réussie !'
        });
      } else {
        console.log('=== NOUPIA TEST FAILED ===');
        return NextResponse.json({
          success: false,
          message: result.message || 'Erreur de connexion à NOUPIA'
        });
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        console.log('=== NOUPIA TEST TIMEOUT ===');
        return NextResponse.json({
          success: false,
          message: 'Timeout de connexion à l\'API NOUPIA'
        }, { status: 408 });
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('=== NOUPIA TEST ERROR ===');
    console.error('Error testing NOUPIA connection:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion à l\'API NOUPIA',
      error: error?.message || 'Unknown error'
    }, { status: 500 });
  }
} 