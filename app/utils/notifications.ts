import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

export async function addNotification(userId: string, type: string, message: string): Promise<Notification> {
  const notification = {
    id: uuidv4(),
    user_id: userId,
    type,
    message,
    created_at: new Date().toISOString(),
    read: false,
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('Erreur création notification:', error);
    throw new Error('Erreur lors de la création de la notification');
  }

  return data;
} 