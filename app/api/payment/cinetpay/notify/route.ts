import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CinetpayTransaction {
  cpm_trans_id: string;
  cpm_site_id?: string;
  status: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpm_trans_id, cpm_site_id } = body;

    if (!cpm_trans_id) {
      console.log(`[${new Date().toISOString()}] cpm_trans_id non fourni`);
      return NextResponse.json({ error: 'cpm_trans_id non fourni' }, { status: 400 });
    }

    // Log de la requête
    console.log(`[${new Date().toISOString()}] NOTIFY: trans_id=${cpm_trans_id}, site_id=${cpm_site_id}`);

    // Vérifier si la transaction existe déjà et n'a pas été traitée
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('cinetpay_transactions')
      .select('*')
      .eq('cpm_trans_id', cpm_trans_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Erreur récupération transaction:', fetchError);
    }

    // Si déjà traitée, on arrête
    if (existingTransaction && existingTransaction.status === 'ACCEPTED') {
      console.log(`[${new Date().toISOString()}] Transaction déjà traitée`);
      return NextResponse.json({ message: 'Déjà traité' });
    }

    // Appel à l'API CinetPay pour vérifier le statut réel
    const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
    const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
    const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

    const checkRes = await fetch(CINETPAY_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id
      })
    });
    const checkData = await checkRes.json();

    // Log du retour API
    console.log(`[${new Date().toISOString()}] API CinetPay: ${JSON.stringify(checkData)}`);

    // Vérification du code retour
    if (checkData.code === '00' && checkData.data && checkData.data.status === 'ACCEPTED') {
      // Mettre à jour la transaction comme validée
      if (existingTransaction) {
        const { error: updateError } = await supabase
          .from('cinetpay_transactions')
          .update({ status: 'ACCEPTED' })
          .eq('cpm_trans_id', cpm_trans_id);

        if (updateError) {
          console.error('Erreur mise à jour transaction:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('cinetpay_transactions')
          .insert({
            cpm_trans_id,
            cpm_site_id,
            status: 'ACCEPTED',
            ...checkData.data
          });

        if (insertError) {
          console.error('Erreur insertion transaction:', insertError);
        }
      }

      console.log(`[${new Date().toISOString()}] Paiement accepté pour trans_id=${cpm_trans_id}`);
      
      // Mise à jour de la date_dernier_paiement de l'utilisateur si possible
      try {
        const phone = checkData.data?.customer_phone_number || checkData.data?.phone;
        if (phone) {
          // Trouver l'utilisateur par numéro de téléphone
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', phone)
            .single();

          if (!userError && user) {
            // Mettre à jour la date de dernier paiement
            const { error: updateUserError } = await supabase
              .from('users')
              .update({ 
                date_dernier_paiement: new Date().toISOString()
              })
              .eq('id', user.id);

            if (updateUserError) {
              console.error('Erreur mise à jour utilisateur:', updateUserError);
            }

            // Ajout : crédit du parrain si présent
            if (user.parrain) {
              const { data: parrain, error: parrainError } = await supabase
                .from('users')
                .select('*')
                .eq('phone', user.parrain)
                .single();

              if (!parrainError && parrain) {
                const { error: updateParrainError } = await supabase
                  .from('users')
                  .update({ 
                    credits: (parrain.credits || 0) + 1000
                  })
                  .eq('id', parrain.id);

                if (updateParrainError) {
                  console.error('Erreur mise à jour parrain:', updateParrainError);
                } else {
                  console.log(`[${new Date().toISOString()}] Parrain ${parrain.phone} crédité de 1000 crédits`);
                }
              }
            }

            console.log(`[${new Date().toISOString()}] Abonnement mis à jour pour ${phone}`);
          }
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Erreur MAJ abonnement utilisateur:`, err);
      }

      return NextResponse.json({ message: 'Félicitations, votre paiement a été effectué avec succès' });
    } else {
      // Paiement refusé
      if (existingTransaction) {
        const { error: updateError } = await supabase
          .from('cinetpay_transactions')
          .update({ status: 'REFUSED' })
          .eq('cpm_trans_id', cpm_trans_id);

        if (updateError) {
          console.error('Erreur mise à jour transaction refusée:', updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('cinetpay_transactions')
          .insert({
            cpm_trans_id,
            cpm_site_id,
            status: 'REFUSED',
            ...checkData.data
          });

        if (insertError) {
          console.error('Erreur insertion transaction refusée:', insertError);
        }
      }

      console.log(`[${new Date().toISOString()}] Paiement refusé pour trans_id=${cpm_trans_id} : ${checkData.message}`);
      return NextResponse.json({ error: 'Echec, votre paiement a échoué pour cause : ' + (checkData.message || 'inconnue') });
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error(`[${new Date().toISOString()}] Erreur:`, errMsg);
    return NextResponse.json({ error: 'Erreur serveur: ' + errMsg }, { status: 500 });
  }
} 