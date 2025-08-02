import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans route.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

interface Notification {
  id: string;
  user_id: string;
  message: string;
  date: string;
  lu: boolean;
}

const ADMIN_PHONE = "+237699486146";

// GET /api/admin/notifications?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  
  // L'admin ne reçoit jamais de notifications
  if (userId === ADMIN_PHONE) {
    return NextResponse.json([]);
  }
  
  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.eq.all`)
    .order('date', { ascending: false });

  if (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }

  return NextResponse.json(notifs || []);
}

// POST /api/admin/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message } = body;
    if (!userId || !message) return NextResponse.json({ error: 'userId et message requis' }, { status: 400 });
    
    const notif = {
      id: Date.now().toString(),
      user_id: userId,
      message,
      date: new Date().toISOString(),
      lu: false
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(notif)
      .select()
      .single();

    if (error) {
      console.error('Erreur création notification:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, notif: data });
  } catch (e) {
    console.error('Erreur POST /api/admin/notifications:', e);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi', details: e }, { status: 500 });
  }
}

// PATCH /api/admin/notifications (marquer comme lu)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notifId, userId } = body;
    if (!notifId || !userId) return NextResponse.json({ error: 'notifId et userId requis' }, { status: 400 });
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ lu: true })
      .eq('id', notifId)
      .or(`user_id.eq.${userId},user_id.eq.all`)
      .select();

    if (error) {
      console.error('Erreur mise à jour notification:', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: data && data.length > 0 });
  } catch (e) {
    console.error('Erreur PATCH /api/admin/notifications:', e);
    return NextResponse.json({ error: 'Erreur PATCH', details: e }, { status: 500 });
  }
}

 