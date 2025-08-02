import { NextRequest, NextResponse } from 'next/server';

interface NoupiaWebhookData {
  transaction: string;
  type: string;
  status: 'successful' | 'failed' | 'pending' | 'canceled';
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
  metadata: {
    user_id?: number;
    user_email?: string;
    payment_type?: string;
    days?: number;
    currency?: string;
    amount?: number;
    phone?: number;
    [key: string]: any;
  };
}

interface NoupiaWebhook {
  event: string;
  signature: string;
  message: string;
  data: NoupiaWebhookData;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook NOUPIA reçu');
    
    const body: NoupiaWebhook = await request.json();
    console.log('📥 Données webhook:', JSON.stringify(body, null, 2));
    
    // Vérifier la signature (à implémenter selon votre configuration)
    // const isValidSignature = verifySignature(body, body.signature);
    // if (!isValidSignature) {
    //   console.error('❌ Signature webhook invalide');
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const { event, data } = body;
    
    if (event === 'transaction.completed') {
      console.log('✅ Transaction terminée:', data.status);
      console.log('💰 Montant:', data.amount, data.currency);
      console.log('📱 Métadonnées:', data.metadata);
      
      // Traiter selon le statut
      switch (data.status) {
        case 'successful':
          await handleSuccessfulPayment(data);
          break;
        case 'failed':
          await handleFailedPayment(data);
          break;
        case 'canceled':
          await handleCanceledPayment(data);
          break;
        default:
          console.log('⚠️ Statut non géré:', data.status);
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erreur webhook NOUPIA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: NoupiaWebhookData) {
  try {
    console.log('🎉 Paiement réussi - Mise à jour de l\'abonnement');
    
    const { user_id, user_email, payment_type, days } = data.metadata;
    
    if (user_id && days) {
      // Mettre à jour l'abonnement de l'utilisateur
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/update-payment-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user_id,
          days: days
        }),
      });
      
      if (response.ok) {
        console.log('✅ Abonnement mis à jour pour l\'utilisateur:', user_id);
      } else {
        console.error('❌ Erreur mise à jour abonnement:', response.status);
      }
    }
    
    // Log de la transaction réussie
    console.log('📊 Transaction réussie:', {
      transaction: data.transaction,
      amount: data.amount,
      currency: data.currency,
      user_id: data.metadata.user_id,
      date: data.date,
      time: data.time
    });
    
  } catch (error) {
    console.error('❌ Erreur traitement paiement réussi:', error);
  }
}

async function handleFailedPayment(data: NoupiaWebhookData) {
  console.log('❌ Paiement échoué:', {
    transaction: data.transaction,
    amount: data.amount,
    currency: data.currency,
    user_id: data.metadata.user_id,
    message: data.description
  });
  
  // Ici vous pouvez ajouter la logique pour :
  // - Notifier l'utilisateur de l'échec
  // - Réinitialiser le statut de paiement
  // - Envoyer un email de notification
}

async function handleCanceledPayment(data: NoupiaWebhookData) {
  console.log('🚫 Paiement annulé:', {
    transaction: data.transaction,
    amount: data.amount,
    currency: data.currency,
    user_id: data.metadata.user_id
  });
  
  // Ici vous pouvez ajouter la logique pour :
  // - Notifier l'utilisateur de l'annulation
  // - Réinitialiser le statut de paiement
}

export async function GET(request: NextRequest) {
  // Endpoint pour vérifier que le webhook est accessible
  return NextResponse.json({ 
    status: 'NOUPIA webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
} 