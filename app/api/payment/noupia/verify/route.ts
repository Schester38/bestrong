import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY || 'pBvYpdUaFuoEduhLZ0.o8vmaUqvZED5obsPrr0s_WVZh8Innn.q2j852ye42N924H_mBn8C.DlDceR8JiPeI5OqdS4szf1zM63AcDeOhFiE1YgRkk.XWBs2kvVUQoAFJlt0RH3f1QrrE3MaQd6da8j7Z56osk16J1tfCzw9SQqiRrIhsekaey.usBsS6Pt3o4QcfviA2Umi8CB8aTh5.ZD4g4QFka1J3TyC60ejPQV4tyJ28WFixeAKdj4suYl_';
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY || '3dZjlyglnGyLm1KI1BXFSszD17OnoXZgEHGMRP_mflo5iCO0VjPh3u8DRjlsdVu88duCI0gsbl_FjMSL7U73ZcOEPNcyz4ycSbx9toR0taIhmcQjhcAqjMcB9KuNcuGX';

interface NoupiaVerifyRequest {
  transaction: string;
}

interface NoupiaVerifyResponse {
  response: string;
  code: string;
  message: string;
  data?: {
    transaction: string;
    type: string;
    status: 'successful' | 'failed' | 'pending';
    amount: string;
    fee: string;
    currency: string;
    reference: string;
    description: string;
    date: string;
    time: string;
    timestamp: number;
    method: string;
    payer: string;
    call: string;
    country: string;
    ip: string;
    metadata?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: NoupiaVerifyRequest = await request.json();

    // Validation des données
    if (!body.transaction) {
      return NextResponse.json({
        response: 'error',
        code: 'MISSING_TRANSACTION',
        message: 'ID de transaction manquant'
      }, { status: 400 });
    }

    console.log('Verifying NOUPIA payment:', body.transaction);

    // Appel à l'API NOUPIA pour vérifier
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
      body: JSON.stringify({
        operation: 'verify',
        transaction: body.transaction
      })
    });

    const result: NoupiaVerifyResponse = await response.json();

    console.log('NOUPIA verify response:', result);

    if (result.response === 'success' && result.data) {
      // Si le paiement est réussi, mettre à jour les crédits de l'utilisateur
      if (result.data.status === 'successful') {
        console.log('Payment successful, updating user credits...');
        
        // Ici vous pouvez ajouter la logique pour créditer l'utilisateur
        // Par exemple, appeler votre API de mise à jour des crédits
        try {
          // Exemple : mettre à jour les crédits dans Supabase
          // await updateUserCredits(userId, amount);
          console.log('User credits updated successfully');
        } catch (error) {
          console.error('Error updating user credits:', error);
        }
      }

      return NextResponse.json(result);
    } else {
      console.error('NOUPIA verify error:', result);
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error('Error verifying NOUPIA payment:', error);
    return NextResponse.json({
      response: 'error',
      code: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 