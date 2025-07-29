import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

interface NoupiaPaymentRequest {
  amount: number;
  phone: string;
  email: string;
  name: string;
  reference: string;
  method: 'mobilemoney' | 'noupia';
  country: string;
  currency: string;
}

interface NoupiaResponse {
  response: string;
  code: string;
  message: string;
  data?: {
    transaction: string;
    channel_ussd?: string;
    channel_name?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: NoupiaPaymentRequest = await request.json();

    // Validation des données
    if (!body.amount || !body.phone || !body.email || !body.name) {
      return NextResponse.json({
        response: 'error',
        code: 'MISSING_PARAMETERS',
        message: 'Paramètres manquants'
      }, { status: 400 });
    }

    // Préparer les données pour l'API NOUPIA
    const noupiaData = {
      operation: 'initiate',
      reference: body.reference,
      amount: body.amount,
      phone: parseInt(body.phone.replace(/\D/g, '')), // Supprimer les caractères non numériques
      method: body.method,
      country: body.country,
      currency: body.currency,
      email: body.email,
      name: body.name,
    };

    console.log('Initiating NOUPIA payment:', noupiaData);

    // Appel à l'API NOUPIA
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
      body: JSON.stringify(noupiaData)
    });

    const result: NoupiaResponse = await response.json();

    console.log('NOUPIA API response:', result);

    if (result.response === 'success') {
      // Enregistrer la transaction dans votre base de données si nécessaire
      console.log('Payment initiated successfully:', result.data?.transaction);
      
      return NextResponse.json(result);
    } else {
      console.error('NOUPIA payment error:', result);
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Error initiating NOUPIA payment:', error);
    return NextResponse.json({
      response: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 