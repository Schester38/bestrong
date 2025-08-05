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

    // 3. Récupérer l'historique des connexions
    const { data: loginHistory, error: loginError } = await supabase
      .from('user_activity_logs')
      .select('created_at')
      .eq('user_id', id)
      .eq('action', 'login')
      .order('created_at', { ascending: false })
      .limit(30)

    // 4. Calculer les badges
    const totalTasks = completions?.length || 0
    const userCreatedAt = new Date(user.created_at || user.date_inscription)
    const isEarlyAdopter = userCreatedAt < new Date('2024-01-01') // Exemple: avant 2024

    // Calculer la série de connexions
    let currentStreak = 0
    if (loginHistory && loginHistory.length > 0) {
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

    // Compter les partages (si une table existe)
    const { data: shares, error: sharesError } = await supabase
      .from('user_shares')
      .select('*')
      .eq('user_id', id)

    const totalShares = shares?.length || 0

    // Compter les tâches rapides (complétées en moins d'1h)
    const quickTasks = completions?.filter(completion => {
      const startTime = new Date(completion.created_at)
      const endTime = new Date(completion.updated_at || completion.created_at)
      const duration = endTime.getTime() - startTime.getTime()
      return duration <= 60 * 60 * 1000 // 1 heure
    }).length || 0

    const badges = [
      {
        id: 'first-task',
        name: 'Première Tâche',
        description: 'Complétez votre première tâche',
        icon: 'target',
        color: 'bg-blue-500',
        category: 'achievement',
        unlocked: totalTasks >= 1,
        progress: Math.min(totalTasks, 1),
        maxProgress: 1,
        unlockedAt: totalTasks >= 1 ? completions?.[0]?.created_at : undefined
      },
      {
        id: 'task-master',
        name: 'Maître des Tâches',
        description: 'Complétez 50 tâches',
        icon: 'trophy',
        color: 'bg-yellow-500',
        category: 'milestone',
        unlocked: totalTasks >= 50,
        progress: Math.min(totalTasks, 50),
        maxProgress: 50,
        unlockedAt: totalTasks >= 50 ? completions?.[49]?.created_at : undefined
      },
      {
        id: 'streak-7',
        name: 'Série de 7 Jours',
        description: 'Connectez-vous 7 jours de suite',
        icon: 'star',
        color: 'bg-purple-500',
        category: 'milestone',
        unlocked: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        maxProgress: 7,
        unlockedAt: currentStreak >= 7 ? loginHistory?.[6]?.created_at : undefined
      },
      {
        id: 'early-adopter',
        name: 'Early Adopter',
        description: 'Rejoignez BE STRONG dans les premiers',
        icon: 'crown',
        color: 'bg-gradient-to-r from-pink-500 to-purple-600',
        category: 'special',
        unlocked: isEarlyAdopter,
        unlockedAt: isEarlyAdopter ? userCreatedAt.toISOString() : undefined
      },
      {
        id: 'social-butterfly',
        name: 'Papillon Social',
        description: 'Partagez 10 fois du contenu',
        icon: 'heart',
        color: 'bg-pink-500',
        category: 'achievement',
        unlocked: totalShares >= 10,
        progress: Math.min(totalShares, 10),
        maxProgress: 10,
        unlockedAt: totalShares >= 10 ? shares?.[9]?.created_at : undefined
      },
      {
        id: 'speed-demon',
        name: 'Démon de Vitesse',
        description: 'Complétez 5 tâches en 1 heure',
        icon: 'zap',
        color: 'bg-orange-500',
        category: 'achievement',
        unlocked: quickTasks >= 5,
        progress: Math.min(quickTasks, 5),
        maxProgress: 5,
        unlockedAt: quickTasks >= 5 ? completions?.find(c => {
          const startTime = new Date(c.created_at)
          const endTime = new Date(c.updated_at || c.created_at)
          return (endTime.getTime() - startTime.getTime()) <= 60 * 60 * 1000
        })?.created_at : undefined
      }
    ]

    return NextResponse.json({
      badges,
      summary: {
        totalBadges: badges.length,
        unlockedBadges: badges.filter(b => b.unlocked).length,
        totalTasks,
        currentStreak,
        totalShares
      }
    })

  } catch (error) {
    console.error('Erreur API badges:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 