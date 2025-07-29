import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('NOUPIA Webhook received:', body);

    // Vérifier la signature du webhook (optionnel mais recommandé)
    const signature = request.headers.get('x-noupia-signature');
    
    // Traiter les différents types de notifications
    if (body.type === 'payment_success') {
      console.log('Payment successful:', body.transaction_id);
      
      // Mettre à jour les crédits de l'utilisateur
      // Ici vous pouvez ajouter la logique pour créditer l'utilisateur
      
    } else if (body.type === 'payment_failed') {
      console.log('Payment failed:', body.transaction_id);
      
    } else if (body.type === 'payment_pending') {
      console.log('Payment pending:', body.transaction_id);
    }

    // Envoyer un email de notification (optionnel)
    if (process.env.NOUPIA_WEBHOOK_EMAIL) {
      // Ici vous pouvez ajouter la logique pour envoyer un email
      console.log('Sending notification to:', process.env.NOUPIA_WEBHOOK_EMAIL);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Error processing NOUPIA webhook:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing webhook' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Endpoint pour vérifier que le webhook est accessible
  return NextResponse.json({ 
    status: 'NOUPIA webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
} 