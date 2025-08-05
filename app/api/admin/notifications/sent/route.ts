import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// GET /api/admin/notifications/sent - Récupérer tous les messages envoyés par l'admin
export async function GET(req: NextRequest) {
  try {
    // Récupérer toutes les notifications (messages envoyés par l'admin)
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur récupération messages envoyés:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }

    // Transformer les données pour inclure les informations utilisateur
    const notificationsWithUserInfo = await Promise.all(
      (notifications || []).map(async (notif) => {
        // Récupérer les informations de l'utilisateur
        let userInfo = null;
        if (notif.user_id !== 'all') {
          const { data: user } = await supabase
            .from('users')
            .select('phone, pseudo')
            .eq('id', notif.user_id)
            .single();
          userInfo = user;
        }

        return {
          id: notif.id,
          message: notif.message,
          date: notif.date,
          lu: notif.lu,
          target: notif.user_id === 'all' ? 'Tous les utilisateurs' : userInfo?.pseudo || userInfo?.phone || notif.user_id,
          userId: notif.user_id
        };
      })
    );

    return NextResponse.json(notificationsWithUserInfo);
  } catch (e) {
    console.error('Erreur GET /api/admin/notifications/sent:', e);
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages', details: e }, { status: 500 });
  }
} 