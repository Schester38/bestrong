import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CinetpayTransaction {
  cpm_trans_id: string;
  cpm_site_id?: string;
  status: string;
  [key: string]: unknown;
}

// Chemin du log
const logFilePath = path.join(process.cwd(), 'data', `cinetpay-log_${new Date().toISOString().slice(0,10)}.log`);
// Chemin des transactions
const transactionsFilePath = path.join(process.cwd(), 'data', 'cinetpay-transactions.json');

// Fonction pour logguer
function logToFile(content: string) {
  fs.appendFileSync(logFilePath, content + '\n', { encoding: 'utf8' });
}

// Charger les transactions
function loadTransactions(): CinetpayTransaction[] {
  try {
    if (fs.existsSync(transactionsFilePath)) {
      return JSON.parse(fs.readFileSync(transactionsFilePath, 'utf8'));
    }
  } catch {}
  return [];
}

// Sauvegarder les transactions
function saveTransactions(transactions: CinetpayTransaction[]) {
  fs.writeFileSync(transactionsFilePath, JSON.stringify(transactions, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpm_trans_id, cpm_site_id } = body;

    if (!cpm_trans_id) {
      logToFile(`[${new Date().toISOString()}] cpm_trans_id non fourni`);
      return NextResponse.json({ error: 'cpm_trans_id non fourni' }, { status: 400 });
    }

    // Log de la requête
    logToFile(`[${new Date().toISOString()}] NOTIFY: trans_id=${cpm_trans_id}, site_id=${cpm_site_id}`);

    // Vérifier si la transaction existe déjà et n'a pas été traitée
    const transactions = loadTransactions();
    const transaction = transactions.find((t: CinetpayTransaction) => t.cpm_trans_id === cpm_trans_id);

    // Si déjà traitée, on arrête
    if (transaction && transaction.status === 'ACCEPTED') {
      logToFile(`[${new Date().toISOString()}] Transaction déjà traitée`);
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
    logToFile(`[${new Date().toISOString()}] API CinetPay: ${JSON.stringify(checkData)}`);

    // Vérification du code retour
    if (checkData.code === '00' && checkData.data && checkData.data.status === 'ACCEPTED') {
      // Mettre à jour la transaction comme validée
      if (transaction) {
        transaction.status = 'ACCEPTED';
      } else {
        transactions.push({
          cpm_trans_id,
          cpm_site_id,
          status: 'ACCEPTED',
          ...checkData.data
        });
      }
      saveTransactions(transactions);
      logToFile(`[${new Date().toISOString()}] Paiement accepté pour trans_id=${cpm_trans_id}`);
      // Ici tu peux débloquer l'accès utilisateur (mise à jour users.json, etc.)
      // Mise à jour de la dateDernierPaiement de l'utilisateur si possible
      try {
        const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
        if (fs.existsSync(usersFilePath)) {
          const usersData = fs.readFileSync(usersFilePath, 'utf8');
          const users = JSON.parse(usersData);
          // On tente de trouver l'utilisateur par numéro de téléphone
          const phone = checkData.data?.customer_phone_number || checkData.data?.phone;
          if (phone) {
            const idxUser = users.findIndex((u: { phone: string }) => u.phone === phone);
            if (idxUser !== -1) {
              users[idxUser].dateDernierPaiement = new Date().toISOString();
              // Ajout : crédit du parrain si présent
              const codeParrain = users[idxUser].parrain;
              if (codeParrain) {
                const idxParrain = users.findIndex((u: { phone: string }) => u.phone === codeParrain);
                if (idxParrain !== -1) {
                  users[idxParrain].credits = (users[idxParrain].credits || 0) + 1000;
                  logToFile(`[${new Date().toISOString()}] Parrain ${users[idxParrain].phone} crédité de 1000 crédits`);
                }
              }
              fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
              logToFile(`[${new Date().toISOString()}] Abonnement mis à jour pour ${phone}`);
            }
          }
        }
      } catch (err) {
        logToFile(`[${new Date().toISOString()}] Erreur MAJ abonnement utilisateur: ${err}`);
      }
      return NextResponse.json({ message: 'Félicitations, votre paiement a été effectué avec succès' });
    } else {
      // Paiement refusé
      if (transaction) {
        transaction.status = 'REFUSED';
      } else {
        transactions.push({
          cpm_trans_id,
          cpm_site_id,
          status: 'REFUSED',
          ...checkData.data
        });
      }
      saveTransactions(transactions);
      logToFile(`[${new Date().toISOString()}] Paiement refusé pour trans_id=${cpm_trans_id} : ${checkData.message}`);
      return NextResponse.json({ error: 'Echec, votre paiement a échoué pour cause : ' + (checkData.message || 'inconnue') });
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    logToFile(`[${new Date().toISOString()}] Erreur: ${errMsg}`);
    return NextResponse.json({ error: 'Erreur serveur: ' + errMsg }, { status: 500 });
  }
} 