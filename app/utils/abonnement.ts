import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const notificationsFilePath = path.join(process.cwd(), 'data', 'notifications.json');

function loadUsers() {
  if (fs.existsSync(usersFilePath)) {
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  }
  return [];
}
function saveNotifications(notifs: Record<string, unknown>[]) {
  fs.writeFileSync(notificationsFilePath, JSON.stringify(notifs, null, 2));
}
function loadNotifications() {
  if (fs.existsSync(notificationsFilePath)) {
    return JSON.parse(fs.readFileSync(notificationsFilePath, 'utf8'));
  }
  return [];
}

export function sendAbonnementNotifications() {
  const users = loadUsers();
  const notifs = loadNotifications();
  const now = new Date();
  for (const user of users) {
    if (!user.dateDernierPaiement) continue;
    const lastPay = new Date(user.dateDernierPaiement);
    const diffDays = Math.floor((now.getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 28 || diffDays === 29) {
      // Vérifier si la notif existe déjà pour ce jour
      const alreadySent = notifs.some((n: Record<string, unknown>) => n.userId === user.id && typeof n.message === 'string' && n.message.includes('expire') && typeof n.date === 'string' && n.date.startsWith(now.toISOString().slice(0,10)));
      if (!alreadySent) {
        const message = diffDays === 28
          ? "Votre abonnement expire dans 2 jours. Pensez à renouveler pour ne pas perdre l'accès au service."
          : "Votre abonnement expire demain ! Renouvelez-le pour garder l'accès au service.";
        notifs.push({
          id: Date.now().toString() + Math.floor(Math.random()*1000),
          userId: user.id,
          message,
          date: new Date().toISOString(),
          lu: false
        });
      }
    }
  }
  saveNotifications(notifs);
}

if (require.main === module) {
  sendAbonnementNotifications();
  console.log('Notifications d\'abonnement envoyées (J-2 et J-1)');
} 