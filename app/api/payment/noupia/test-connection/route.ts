import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing basic connectivity to Noupia API...');
    
    const response = await fetch('https://api.noupia.com', {
      method: 'GET',
      headers: {
        'User-Agent': 'BE-STRONG-APP/1.0'
      }
    });

    console.log('Connectivity test result:', response.status, response.statusText);
    
    return NextResponse.json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      message: 'Connectivity test completed'
    });

  } catch (error) {
    console.error('Connectivity test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Connectivity test failed'
    }, { status: 500 });
  }
} 