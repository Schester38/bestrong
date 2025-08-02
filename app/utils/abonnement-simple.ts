import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface pour un paiement simple
export interface SimplePayment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'orange_money' | 'mtn_money' | 'paypal';
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
  dashboard_access_granted: boolean;
  created_at: string;
}

/**
 * Vérifier si un utilisateur a accès au dashboard
 */
export async function checkDashboardAccess(userId: string): Promise<boolean> {
  try {
    // Vérifier dans la table users (méthode actuelle)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('dashboard_access, date_dernier_paiement')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return false;
    }

    // Si dashboard_access est true, l'utilisateur a accès
    if (user.dashboard_access) {
      return true;
    }

    // Vérifier si l'utilisateur a un paiement récent (dans les 30 derniers jours)
    if (user.date_dernier_paiement) {
      const lastPayment = new Date(user.date_dernier_paiement);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (lastPayment > thirtyDaysAgo) {
        return true;
      }
    }

    // Vérifier dans la table abonnements (nouvelle méthode)
    const { data: abonnement, error: abonnementError } = await supabase
      .from('abonnements')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!abonnementError && abonnement) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erreur vérification accès dashboard:', error);
    return false;
  }
}

/**
 * Enregistrer un nouveau paiement
 */
export async function recordPayment(paymentData: {
  userId: string;
  amount: number;
  paymentMethod: 'orange_money' | 'mtn_money' | 'paypal';
}): Promise<boolean> {
  try {
    const payment: SimplePayment = {
      id: Date.now().toString(),
      user_id: paymentData.userId,
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod,
      status: 'completed',
      payment_date: new Date().toISOString(),
      dashboard_access_granted: true,
      created_at: new Date().toISOString()
    };

    // Enregistrer dans la table abonnements
    const { error: abonnementError } = await supabase
      .from('abonnements')
      .insert({
        id: payment.id,
        user_id: payment.user_id,
        type: 'dashboard_access',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: null, // Accès permanent
        created_at: new Date().toISOString()
      });

    if (abonnementError) {
      console.error('Erreur enregistrement abonnement:', abonnementError);
    }

    // Mettre à jour la table users (méthode actuelle)
    const { error: userError } = await supabase
      .from('users')
      .update({
        dashboard_access: true,
        date_dernier_paiement: new Date().toISOString()
      })
      .eq('id', paymentData.userId);

    if (userError) {
      console.error('Erreur mise à jour utilisateur:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur enregistrement paiement:', error);
    return false;
  }
}

/**
 * Obtenir l'historique des paiements d'un utilisateur
 */
export async function getUserPaymentHistory(userId: string): Promise<SimplePayment[]> {
  try {
    const { data: abonnements, error } = await supabase
      .from('abonnements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération historique paiements:', error);
      return [];
    }

    // Convertir les abonnements en format SimplePayment
    return abonnements?.map(abonnement => ({
      id: abonnement.id,
      user_id: abonnement.user_id,
      amount: 1000, // Montant fixe pour l'accès dashboard
      payment_method: 'orange_money' as const, // Par défaut
      status: abonnement.status === 'active' ? 'completed' : 'failed',
      payment_date: abonnement.start_date,
      dashboard_access_granted: abonnement.status === 'active',
      created_at: abonnement.created_at
    })) || [];
  } catch (error) {
    console.error('Erreur historique paiements:', error);
    return [];
  }
}

/**
 * Statistiques des paiements (pour l'admin)
 */
export async function getPaymentStats() {
  try {
    // Total des paiements
    const { data: totalPayments, error: totalError } = await supabase
      .from('abonnements')
      .select('*', { count: 'exact' })
      .eq('type', 'dashboard_access');

    // Paiements ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyPayments, error: monthlyError } = await supabase
      .from('abonnements')
      .select('*', { count: 'exact' })
      .eq('type', 'dashboard_access')
      .gte('created_at', startOfMonth.toISOString());

    // Revenus estimés
    const totalRevenue = (totalPayments?.length || 0) * 1000; // 1000 FCFA par paiement
    const monthlyRevenue = (monthlyPayments?.length || 0) * 1000;

    return {
      totalPayments: totalPayments?.length || 0,
      monthlyPayments: monthlyPayments?.length || 0,
      totalRevenue,
      monthlyRevenue,
      error: totalError || monthlyError
    };
  } catch (error) {
    console.error('Erreur statistiques paiements:', error);
    return {
      totalPayments: 0,
      monthlyPayments: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
} 