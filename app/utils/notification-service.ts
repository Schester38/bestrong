import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface NotificationData {
  userId: string
  type: 'task' | 'achievement' | 'reminder' | 'social' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export class NotificationService {
  // Créer une notification
  static async createNotification(data: NotificationData) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          action_url: data.actionUrl,
          read: false,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erreur création notification:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur création notification:', error)
      return false
    }
  }

  // Notifications de bienvenue
  static async createWelcomeNotification(userId: string) {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Bienvenue sur BE STRONG ! 🎉',
      message: 'Commencez votre parcours en complétant votre première tâche BE STRONG.',
      priority: 'high',
      actionUrl: '/dashboard?tab=tasks'
    })
  }

  // Notifications de challenges
  static async createChallengeNotification(userId: string, challengeTitle: string, reward?: string) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `Défi complété : ${challengeTitle} 🏆`,
      message: reward 
        ? `Félicitations ! Vous avez gagné ${reward} pour ce défi.`
        : 'Félicitations ! Vous avez complété ce défi avec succès.',
      priority: 'medium',
      actionUrl: '/dashboard?tab=challenges'
    })
  }

  // Notifications de badges
  static async createBadgeNotification(userId: string, badgeName: string, badgeDescription: string) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `Nouveau badge : ${badgeName} 🎖️`,
      message: badgeDescription,
      priority: 'medium',
      actionUrl: '/dashboard?tab=badges'
    })
  }

  // Notifications de niveau
  static async createLevelUpNotification(userId: string, newLevel: number) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `Niveau ${newLevel} atteint ! ⭐`,
      message: `Félicitations ! Vous avez atteint le niveau ${newLevel}. Continuez comme ça !`,
      priority: 'medium',
      actionUrl: '/dashboard?tab=stats'
    })
  }

  // Notifications de streak
  static async createStreakNotification(userId: string, streakDays: number) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `Série de ${streakDays} jours ! 🔥`,
      message: `Impressionnant ! Vous êtes actif depuis ${streakDays} jours consécutifs.`,
      priority: 'medium',
      actionUrl: '/dashboard?tab=stats'
    })
  }

  // Notifications de rappel
  static async createReminderNotification(userId: string, message: string) {
    return this.createNotification({
      userId,
      type: 'reminder',
      title: 'Rappel important ⏰',
      message,
      priority: 'medium',
      actionUrl: '/dashboard'
    })
  }

  // Notifications de tâches
  static async createTaskNotification(userId: string, taskTitle: string, isCompleted: boolean) {
    if (isCompleted) {
      return this.createNotification({
        userId,
        type: 'task',
        title: `Tâche complétée : ${taskTitle} ✅`,
        message: 'Bonne continuation ! Continuez à créer du contenu de qualité.',
        priority: 'low',
        actionUrl: '/dashboard?tab=tasks'
      })
    } else {
      return this.createNotification({
        userId,
        type: 'reminder',
        title: `Tâche en cours : ${taskTitle} 📝`,
        message: 'N\'oubliez pas de compléter cette tâche pour gagner des crédits.',
        priority: 'medium',
        actionUrl: '/dashboard?tab=tasks'
      })
    }
  }

  // Notifications de crédits
  static async createCreditsNotification(userId: string, creditsEarned: number, reason: string) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title: `+${creditsEarned} crédits gagnés ! 💰`,
      message: `Vous avez gagné ${creditsEarned} crédits : ${reason}`,
      priority: 'low',
      actionUrl: '/dashboard?tab=credits'
    })
  }

  // Notifications de maintenance
  static async createMaintenanceNotification(userId: string, message: string) {
    return this.createNotification({
      userId,
      type: 'system',
      title: 'Maintenance prévue 🔧',
      message,
      priority: 'high',
      actionUrl: '/dashboard'
    })
  }

  // Notifications de nouvelles fonctionnalités
  static async createFeatureNotification(userId: string, featureName: string, description: string) {
    return this.createNotification({
      userId,
      type: 'system',
      title: `Nouvelle fonctionnalité : ${featureName} 🆕`,
      message: description,
      priority: 'medium',
      actionUrl: '/dashboard'
    })
  }
} 