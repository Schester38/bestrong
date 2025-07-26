import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  lu: boolean;
}

const notificationsFilePath = path.join(process.cwd(), 'data', 'notifications.json');
const ADMIN_PHONE = "+237699486146";

function loadNotifications() {
  try {
    if (fs.existsSync(notificationsFilePath)) {
      const data = fs.readFileSync(notificationsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erreur chargement notifications:', e);
  }
  return [];
}

function saveNotifications(notifs: Notification[]) {
  try {
    fs.writeFileSync(notificationsFilePath, JSON.stringify(notifs, null, 2));
  } catch (e) {
    console.error('Erreur sauvegarde notifications:', e);
  }
}

// GET /api/admin/notifications?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
  
  // L'admin ne reçoit jamais de notifications
  if (userId === ADMIN_PHONE) {
    return NextResponse.json([]);
  }
  
  const notifs = loadNotifications();
  // Notifications pour cet utilisateur ou pour tous
  const userNotifs = notifs.filter((n: Notification) => n.userId === userId || n.userId === 'all');
  userNotifs.sort((a: Notification, b: Notification) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(userNotifs);
}

// POST /api/admin/notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message } = body;
    if (!userId || !message) return NextResponse.json({ error: 'userId et message requis' }, { status: 400 });
    // Bypass admin : accès total
    if (userId === ADMIN_PHONE) {
      const notifs = loadNotifications();
      const notif = {
        id: Date.now().toString(),
        userId,
        message,
        date: new Date().toISOString(),
        lu: false
      };
      notifs.push(notif);
      saveNotifications(notifs);
      return NextResponse.json({ success: true, notif });
    }
    const notifs = loadNotifications();
    const notif = {
      id: Date.now().toString(),
      userId,
      message,
      date: new Date().toISOString(),
      lu: false
    };
    notifs.push(notif);
    saveNotifications(notifs);
    return NextResponse.json({ success: true, notif });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi', details: e }, { status: 500 });
  }
}

// PATCH /api/admin/notifications (marquer comme lu)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notifId, userId } = body;
    if (!notifId || !userId) return NextResponse.json({ error: 'notifId et userId requis' }, { status: 400 });
    const notifs = loadNotifications();
    let updated = false;
    for (const n of notifs) {
      if (n.id === notifId && (n.userId === userId || n.userId === 'all')) {
        n.lu = true;
        updated = true;
      }
    }
    if (updated) saveNotifications(notifs);
    return NextResponse.json({ success: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur PATCH', details: e }, { status: 500 });
  }
}

 