import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Récupérer les tâches complétées
    const { data: completions, error: completionsError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', id)

    if (completionsError) {
      console.error('Erreur récupération completions:', completionsError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // 2. Récupérer les informations utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', id)
      .single()

    if (userError) {
      console.error('Erreur récupération utilisateur:', userError)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // 3. Calculer les statistiques
    const totalTasks = completions?.length || 0
    
    // Tâches ce mois
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const tasksThisMonth = completions?.filter(completion => 
      new Date(completion.created_at) >= startOfMonth
    ).length || 0

    // Temps moyen par tâche (si disponible)
    let averageTime = '2h 15m' // Valeur par défaut
    if (completions && completions.length > 0) {
      // Calculer le temps moyen basé sur les timestamps
      const totalTime = completions.reduce((acc, completion) => {
        const startTime = new Date(completion.created_at)
        const endTime = new Date(completion.updated_at || completion.created_at)
        return acc + (endTime.getTime() - startTime.getTime())
      }, 0)
      
      const avgMs = totalTime / completions.length
      const avgMinutes = Math.floor(avgMs / (1000 * 60))
      const hours = Math.floor(avgMinutes / 60)
      const minutes = avgMinutes % 60
      averageTime = `${hours}h ${minutes}m`
    }

    // Score total (basé sur les crédits ou points)
    const totalScore = user.credits || 0

    // Série actuelle (connexions consécutives)
    const { data: loginHistory, error: loginError } = await supabase
      .from('user_activity_logs')
      .select('created_at')
      .eq('user_id', id)
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(30)

    let currentStreak = 0
    if (loginHistory && loginHistory.length > 0) {
      // Calculer la série de connexions consécutives
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let currentDate = new Date(today)
      for (let i = 0; i < 30; i++) {
        const hasLogin = loginHistory.some(login => {
          const loginDate = new Date(login.created_at)
          loginDate.setHours(0, 0, 0, 0)
          return loginDate.getTime() === currentDate.getTime()
        })
        
        if (hasLogin) {
          currentStreak++
        } else {
          break
        }
        
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }

    // Calculer les changements (comparaison avec le mois précédent)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const tasksLastMonth = completions?.filter(completion => {
      const completionDate = new Date(completion.created_at)
      return completionDate >= lastMonth && completionDate <= endOfLastMonth
    }).length || 0

    const taskChange = tasksLastMonth > 0 
      ? Math.round(((tasksThisMonth - tasksLastMonth) / tasksLastMonth) * 100)
      : 0

    // Statistiques de progression par jour de la semaine
    const weekProgress = [0, 0, 0, 0, 0, 0, 0] // Lundi à Dimanche
    if (completions) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - 7)
      
      completions.forEach(completion => {
        const completionDate = new Date(completion.created_at)
        if (completionDate >= weekStart) {
          const dayOfWeek = completionDate.getDay()
          weekProgress[dayOfWeek]++
        }
      })
    }

    // Convertir en pourcentages pour l'affichage
    const maxTasks = Math.max(...weekProgress, 1)
    const weekProgressPercentages = weekProgress.map(count => 
      Math.round((count / maxTasks) * 100)
    )

    const stats = {
      totalTasks,
      tasksThisMonth,
      taskChange,
      averageTime,
      totalScore,
      currentStreak,
      weekProgress: weekProgressPercentages,
      insights: {
        positive: taskChange > 0 ? `Votre productivité a augmenté de ${Math.abs(taskChange)}% ce mois-ci !` : 'Continuez vos efforts pour améliorer votre productivité.',
        goal: currentStreak < 7 ? `Connectez-vous ${7 - currentStreak} jours de plus pour débloquer le badge "Série de 7 Jours" !` : 'Excellent ! Vous maintenez une série régulière.'
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erreur API stats:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 