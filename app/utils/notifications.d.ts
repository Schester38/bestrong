export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function addNotification(userId: string, type: string, message: string): Notification; 