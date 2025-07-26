import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function sendAbonnementNotifications() {
  try {
    // Récupérer tous les utilisateurs avec une date de dernier paiement
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .not('date_dernier_paiement', 'is', null);

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      return;
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    for (const user of users) {
      if (!user.date_dernier_paiement) continue;
      
      const lastPay = new Date(user.date_dernier_paiement);
      const diffDays = Math.floor((now.getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 28 || diffDays === 29) {
        // Vérifier si la notif existe déjà pour ce jour
        const { data: existingNotifs, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .like('message', '%expire%')
          .like('date', `${today}%`);

        if (notifError) {
          console.error('Erreur vérification notifications existantes:', notifError);
          continue;
        }

        const alreadySent = existingNotifs && existingNotifs.length > 0;
        
        if (!alreadySent) {
          const message = diffDays === 28
            ? "Votre abonnement expire dans 2 jours. Pensez à renouveler pour ne pas perdre l'accès au service."
            : "Votre abonnement expire demain ! Renouvelez-le pour garder l'accès au service.";

          const { error: insertError } = await supabase
            .from('notifications')
            .insert({
              id: Date.now().toString() + Math.floor(Math.random() * 1000),
              user_id: user.id,
              message,
              date: new Date().toISOString(),
              lu: false
            });

          if (insertError) {
            console.error('Erreur création notification abonnement:', insertError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur sendAbonnementNotifications:', error);
  }
}

if (require.main === module) {
  sendAbonnementNotifications();
  console.log('Notifications d\'abonnement envoyées (J-2 et J-1)');
} 