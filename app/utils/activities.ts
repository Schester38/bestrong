import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ActivityData {
  userId: string;
  userPhone: string;
  userPseudo?: string;
  type: 'login' | 'register' | 'logout' | 'task_created' | 'task_completed' | 'credits_earned' | 'credits_spent';
  description: string;
  details?: Record<string, unknown>;
  credits?: number;
}

export async function logActivity(activityData: ActivityData) {
  try {
    const newActivity = {
      id: Date.now().toString(),
      user_id: activityData.userId,
      user_phone: activityData.userPhone,
      user_pseudo: activityData.userPseudo,
      type: activityData.type,
      description: activityData.description,
      details: activityData.details,
      credits: activityData.credits,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('activities')
      .insert(newActivity);

    if (error) {
      console.error('Erreur enregistrement activité:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    return false;
  }
} 