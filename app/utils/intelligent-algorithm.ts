import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UserBehavior {
  userId: string
  lastLogin: Date
  loginFrequency: number
  taskCompletionRate: number
  averageSessionTime: number
  preferredHours: number[]
  totalTasks: number
  streakDays: number
  engagementScore: number
}

interface NotificationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: number
  userMood: 'active' | 'inactive' | 'declining' | 'new'
  recentActivity: string[]
  goals: string[]
}

interface MessageContext {
  userQuery: string
  userHistory: string[]
  currentTask?: string
  userLevel: 'beginner' | 'intermediate' | 'advanced'
  supportNeeded: boolean
}

export class IntelligentAlgorithm {
  
  // Analyser le comportement utilisateur
  static async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    try {
      // Récupérer les données utilisateur
      const { data: activities } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100)

      const { data: taskCompletions } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)

      const { data: user } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single()

      if (!activities || !user) {
        throw new Error('Données utilisateur manquantes')
      }

      // Calculer les métriques
      const now = new Date()
      const userCreated = new Date(user.created_at)
      const daysSinceCreation = Math.floor((now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24))
      
      const lastLogin = activities[0]?.timestamp ? new Date(activities[0].timestamp) : userCreated
      const loginFrequency = activities.length / Math.max(daysSinceCreation, 1)
      
      const taskCompletionRate = taskCompletions ? taskCompletions.length / Math.max(activities.length, 1) : 0
      
      // Analyser les heures préférées
      const hourCounts = new Array(24).fill(0)
      activities.forEach(activity => {
        const hour = new Date(activity.timestamp).getHours()
        hourCounts[hour]++
      })
      const preferredHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(h => h.hour)

      // Calculer le score d'engagement
      const engagementScore = Math.min(100, 
        (loginFrequency * 20) + 
        (taskCompletionRate * 30) + 
        (preferredHours.length * 10) + 
        (Math.min(activities.length / 10, 20))
      )

      return {
        userId,
        lastLogin,
        loginFrequency,
        taskCompletionRate,
        averageSessionTime: 15, // À calculer plus précisément
        preferredHours,
        totalTasks: taskCompletions?.length || 0,
        streakDays: this.calculateStreak(activities),
        engagementScore
      }
    } catch (error) {
      console.error('Erreur analyse comportement:', error)
      throw error
    }
  }

  // Calculer la série de connexions
  private static calculateStreak(activities: any[]): number {
    if (!activities.length) return 0
    
    const dates = activities.map(a => new Date(a.timestamp).toDateString())
    const uniqueDates = [...new Set(dates)].sort()
    
    let streak = 0
    const today = new Date().toDateString()
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const currentDate = new Date(uniqueDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - (uniqueDates.length - 1 - i))
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  // Déterminer le contexte de notification
  static getNotificationContext(userBehavior: UserBehavior): NotificationContext {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay()
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    if (hour >= 6 && hour < 12) timeOfDay = 'morning'
    else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon'
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening'
    else timeOfDay = 'night'

    let userMood: 'active' | 'inactive' | 'declining' | 'new'
    if (userBehavior.engagementScore >= 80) userMood = 'active'
    else if (userBehavior.engagementScore >= 50) userMood = 'inactive'
    else if (userBehavior.engagementScore >= 20) userMood = 'declining'
    else userMood = 'new'

    const recentActivity = this.getRecentActivity(userBehavior)
    const goals = this.generateGoals(userBehavior)

    return {
      timeOfDay,
      dayOfWeek,
      userMood,
      recentActivity,
      goals
    }
  }

  // Générer des notifications intelligentes
  static async generateIntelligentNotifications(userId: string): Promise<any[]> {
    try {
      const userBehavior = await this.analyzeUserBehavior(userId)
      const context = this.getNotificationContext(userBehavior)
      
      const notifications = []

      // Notification de bienvenue pour nouveaux utilisateurs
      if (userBehavior.totalTasks === 0) {
        notifications.push({
          type: 'system',
          title: 'Bienvenue sur BE STRONG ! 🎉',
          message: 'Commencez votre parcours en complétant votre première tâche TikTok.',
          priority: 'high',
          action_url: '/dashboard?tab=tasks'
        })
      }

      // Notifications basées sur l'heure
      if (context.timeOfDay === 'morning' && userBehavior.preferredHours.includes(9)) {
        notifications.push({
          type: 'reminder',
          title: 'Bonjour ! ☀️',
          message: 'C\'est le moment parfait pour créer du contenu TikTok !',
          priority: 'medium',
          action_url: '/dashboard'
        })
      }

      // Notifications de gamification
      if (userBehavior.streakDays >= 3) {
        notifications.push({
          type: 'achievement',
          title: `Série de ${userBehavior.streakDays} jours ! 🔥`,
          message: `Continuez comme ça ! Vous êtes sur une excellente série.`,
          priority: 'medium',
          action_url: '/dashboard?tab=badges'
        })
      }

      // Notifications de motivation
      if (userBehavior.engagementScore < 30) {
        notifications.push({
          type: 'reminder',
          title: 'On vous manque ! 💪',
          message: 'Revenez compléter quelques tâches pour booster votre visibilité.',
          priority: 'high',
          action_url: '/dashboard?tab=tasks'
        })
      }

      // Notifications de progression
      if (userBehavior.totalTasks > 0 && userBehavior.totalTasks % 5 === 0) {
        notifications.push({
          type: 'achievement',
          title: `${userBehavior.totalTasks} tâches complétées ! 🎯`,
          message: 'Félicitations ! Vous progressez bien dans votre parcours.',
          priority: 'medium',
          action_url: '/dashboard?tab=stats'
        })
      }

      return notifications
    } catch (error) {
      console.error('Erreur génération notifications:', error)
      return []
    }
  }

  // Générer des réponses intelligentes
  static generateIntelligentResponse(context: MessageContext): string {
    const { userQuery, userLevel, supportNeeded } = context
    
    const query = userQuery.toLowerCase()
    
    // Réponses pour questions courantes
    if (query.includes('comment') && query.includes('tâche')) {
      return "Pour compléter une tâche, allez dans votre tableau de bord, sélectionnez une tâche et suivez les instructions. Chaque tâche vous rapporte des crédits et améliore votre visibilité TikTok ! 📱✨"
    }
    
    if (query.includes('crédit') || query.includes('gagner')) {
      return "Vous gagnez des crédits en complétant des tâches ! Plus vous êtes actif, plus vous gagnez. Utilisez vos crédits pour débloquer des fonctionnalités premium et booster votre présence TikTok. 💰🚀"
    }
    
    if (query.includes('problème') || query.includes('erreur')) {
      return "Je suis désolé d'entendre que vous avez un problème. Pouvez-vous me donner plus de détails ? En attendant, essayez de rafraîchir la page ou de vous reconnecter. 🔧"
    }
    
    if (query.includes('aide') || query.includes('support')) {
      return "Je suis là pour vous aider ! Que souhaitez-vous savoir ? Vous pouvez aussi consulter notre guide d'aide ou me poser directement vos questions. 🤝"
    }
    
    if (query.includes('bonjour') || query.includes('salut')) {
      return "Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ? Je suis là pour vous accompagner dans votre parcours BE STRONG !"
    }
    
    // Réponses basées sur le niveau utilisateur
    if (userLevel === 'beginner') {
      return "En tant que nouveau membre, je vous recommande de commencer par les tâches simples. N'hésitez pas à me poser toutes vos questions ! 🌱"
    }
    
    if (userLevel === 'advanced') {
      return "Excellent ! En tant qu'utilisateur expérimenté, vous connaissez déjà les bases. Avez-vous des questions sur les fonctionnalités avancées ? 🚀"
    }
    
    // Réponse par défaut
    return "Merci pour votre message ! Je suis là pour vous aider. Pouvez-vous me donner plus de détails sur ce que vous recherchez ? 🤔"
  }

  // Analyser le niveau utilisateur
  static analyzeUserLevel(userBehavior: UserBehavior): 'beginner' | 'intermediate' | 'advanced' {
    if (userBehavior.totalTasks < 5) return 'beginner'
    if (userBehavior.totalTasks < 20) return 'intermediate'
    return 'advanced'
  }

  // Obtenir l'activité récente
  private static getRecentActivity(userBehavior: UserBehavior): string[] {
    const activities = []
    
    if (userBehavior.streakDays > 0) {
      activities.push(`Série de ${userBehavior.streakDays} jours`)
    }
    
    if (userBehavior.totalTasks > 0) {
      activities.push(`${userBehavior.totalTasks} tâches complétées`)
    }
    
    if (userBehavior.engagementScore > 70) {
      activities.push('Utilisateur très actif')
    }
    
    return activities
  }

  // Générer des objectifs personnalisés
  private static generateGoals(userBehavior: UserBehavior): string[] {
    const goals = []
    
    if (userBehavior.totalTasks === 0) {
      goals.push('Compléter votre première tâche')
    } else if (userBehavior.totalTasks < 10) {
      goals.push('Atteindre 10 tâches complétées')
    } else if (userBehavior.totalTasks < 50) {
      goals.push('Atteindre 50 tâches complétées')
    }
    
    if (userBehavior.streakDays < 7) {
      goals.push('Maintenir une série de 7 jours')
    }
    
    if (userBehavior.engagementScore < 50) {
      goals.push('Améliorer votre engagement')
    }
    
    return goals
  }

  // Créer une notification automatiquement
  static async createNotification(userId: string, notification: any) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          action_url: notification.action_url,
          read: false
        })

      if (error) {
        console.error('Erreur création notification:', error)
      }
    } catch (error) {
      console.error('Erreur création notification:', error)
    }
  }

  // Créer un message automatique
  static async createMessage(senderId: string, receiverId: string, content: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          type: 'text',
          is_read: false
        })

      if (error) {
        console.error('Erreur création message:', error)
      }
    } catch (error) {
      console.error('Erreur création message:', error)
    }
  }
} 