import { NextRequest, NextResponse } from 'next/server';

// Clés NOUPIA depuis .env.local
const NOUPIA_DEVELOPER_KEY = process.env.NOUPIA_DEVELOPER_KEY;
const NOUPIA_SUBSCRIPTION_KEY = process.env.NOUPIA_SUBSCRIPTION_KEY;

interface NoupiaPaymentRequest {
  amount: number;
  phone: string;
  email: string;
  name: string;
  reference: string;
  method: 'mobilemoney' | 'noupia' | 'invoice' | 'withdraw';
  operator?: 'mtn' | 'orange' | 'moov' | 'airtel' | 'free' | 'auto';
  country: string;
  currency: string;
  user_id?: number;
}

interface NoupiaResponse {
  response: string;
  code: string;
  message: string;
  data?: {
    transaction: string;
    channel_ussd?: string;
    channel_name?: string;
    amount?: number;
    fee?: number;
    currency?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début de la requête POST /api/payment/noupia/initiate');
    
    const body: NoupiaPaymentRequest = await request.json();
    console.log('📥 Données reçues:', body);
    
    // Vérifier que les clés API sont disponibles
    if (!NOUPIA_DEVELOPER_KEY || !NOUPIA_SUBSCRIPTION_KEY) {
      console.error('❌ Clés API NOUPIA manquantes');
      return NextResponse.json({
        success: false,
        message: 'Configuration API manquante'
      }, { status: 500 });
    }
    console.log('📥 Données reçues:', body);

    // Validation des données
    if (!body.amount || !body.phone) {
      console.error('❌ Paramètres manquants:', { amount: body.amount, phone: body.phone });
      return NextResponse.json({
        success: false,
        message: 'Paramètres manquants'
      }, { status: 400 });
    }

    // Validation du montant minimum selon la documentation NOUPIA
    if (body.amount < 100) {
      console.error('❌ Montant insuffisant:', { amount: body.amount, minimum: 100 });
      return NextResponse.json({
        success: false,
        message: 'Montant minimum requis : 100 XAF'
      }, { status: 400 });
    }

    // Préparer les données pour l'API NOUPIA selon la documentation exacte
    // Paramètres requis + opérateur pour Orange Money
    const noupiaData = {
      operation: 'initiate',
      reference: body.reference.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30),
      amount: parseInt(body.amount.toString()),
      method: body.method,
      phone: parseInt(body.phone.replace(/\D/g, '')),
      country: body.country,
      currency: body.currency,
      // Ajouter l'opérateur seulement pour MTN (Orange utilise method: mobilemoney)
      ...(body.operator && body.operator !== 'auto' && body.operator !== 'orange' && { 
        operator: body.operator.toUpperCase() 
      })
    };

    console.log('📡 Données NOUPIA:', noupiaData);
    console.log('🔍 Debug operator:', { 
      received: body.operator, 
      condition: body.operator && body.operator !== 'auto',
      final: body.operator && body.operator !== 'auto' ? body.operator.toUpperCase() : 'non ajouté'
    });
    console.log('🔍 Debug phone:', { 
      original: body.phone,
      cleaned: body.phone.replace(/\D/g, ''),
      parsed: parseInt(body.phone.replace(/\D/g, ''))
    });
    console.log('🔑 Clés API disponibles:', {
      developerKey: NOUPIA_DEVELOPER_KEY ? '✅' : '❌',
      subscriptionKey: NOUPIA_SUBSCRIPTION_KEY ? '✅' : '❌'
    });

    // Appel API NOUPIA RÉELLE
    console.log('🌐 Appel API NOUPIA réelle...');
    console.log('🔑 Headers envoyés:', {
      'Accept': '*/*',
      'Noupia-API-Signature': 'np-live',
      'Noupia-API-Key': NOUPIA_DEVELOPER_KEY ? '✅ Présent' : '❌ Manquant',
      'Noupia-Product-Key': NOUPIA_SUBSCRIPTION_KEY ? '✅ Présent' : '❌ Manquant',
      'Content-Type': 'application/json'
    });
    
    try {
      const response = await fetch('https://api.noupia.com/pay', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Noupia-API-Signature': 'np-live',
          'Noupia-API-Key': NOUPIA_DEVELOPER_KEY,
          'Noupia-Product-Key': NOUPIA_SUBSCRIPTION_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noupiaData)
      });
      console.log('📡 Réponse NOUPIA status:', response.status);

      // Lire la réponse
      const responseText = await response.text();
      console.log('📡 Réponse NOUPIA texte:', responseText);

      let result: NoupiaResponse;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        return NextResponse.json({
          success: false,
          message: 'Réponse invalide de l\'API NOUPIA'
        }, { status: 500 });
      }

      console.log('📡 Réponse NOUPIA parsée:', result);

      if ((response.status === 201 || response.status === 200) && result.response === 'success') {
        console.log('✅ Paiement initié avec succès (API RÉELLE):', result.data?.transaction);
        console.log('📱 USSD Code:', result.data?.channel_ussd);
        
        return NextResponse.json({
          success: true,
          message: 'Paiement initié avec succès',
          data: {
            transaction: result.data?.transaction,
            ussd: result.data?.channel_ussd,
            channel: result.data?.channel_name,
            amount: result.data?.amount,
            fee: result.data?.fee,
            currency: result.data?.currency
          }
        });
      } else {
        console.error('❌ Erreur NOUPIA:', result);
        return NextResponse.json({
          success: false,
          message: result.message || 'Erreur lors de l\'initiation du paiement'
        }, { status: 400 });
      }

    } catch (fetchError) {
      console.error('❌ Erreur fetch:', fetchError);
      
      // En cas d'erreur réseau, retourner une erreur
      return NextResponse.json({
        success: false,
        message: 'Erreur de connexion au service de paiement'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erreur interne détaillée:', error);
    
    return NextResponse.json({
      success: false,
      message: `Erreur interne du serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
} 