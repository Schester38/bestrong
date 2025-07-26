import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function addNotification(userId: string, type: string, message: string): Notification {
  const notificationsFilePath = path.join(process.cwd(), 'data', 'notifications.json');
  let notifications: Notification[] = [];
  if (fs.existsSync(notificationsFilePath)) {
    const raw = fs.readFileSync(notificationsFilePath, 'utf8');
    if (raw.trim()) {
      notifications = JSON.parse(raw);
    }
  }
  const notification: Notification = {
    id: uuidv4(),
    userId,
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.push(notification);
  fs.writeFileSync(notificationsFilePath, JSON.stringify(notifications, null, 2));
  return notification;
} 