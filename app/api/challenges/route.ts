import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Récupérer les défis et la progression d'un utilisateur
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // daily, weekly, monthly, special

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 })
    }

    // Récupérer tous les défis actifs
    let challengesQuery = supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)

    if (type && type !== 'all') {
      challengesQuery = challengesQuery.eq('type', type)
    }

    const { data: challenges, error: challengesError } = await challengesQuery

    if (challengesError) {
      console.error('Erreur récupération défis:', challengesError)
      return NextResponse.json({ error: 'Erreur récupération défis' }, { status: 500 })
    }

    // Récupérer la progression de l'utilisateur
    const { data: userProgress, error: progressError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)

    if (progressError) {
      console.error('Erreur récupération progression:', progressError)
      return NextResponse.json({ error: 'Erreur récupération progression' }, { status: 500 })
    }

    // Combiner les défis avec la progression
    const challengesWithProgress = challenges?.map(challenge => {
      const progress = userProgress?.find(p => p.challenge_id === challenge.id)
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        difficulty: challenge.difficulty,
        category: challenge.category,
        reward: {
          credits: challenge.reward_credits,
          experience: challenge.reward_experience,
          badge: challenge.reward_badge
        },
        progress: {
          current: progress?.current_progress || 0,
          target: challenge.target_value,
          completed: progress?.is_completed || false
        },
        deadline: challenge.deadline,
        completedAt: progress?.completed_at,
        rewardClaimed: progress?.reward_claimed || false
      }
    }) || []

    return NextResponse.json({ challenges: challengesWithProgress })
  } catch (error) {
    console.error('Erreur API challenges:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Mettre à jour la progression d'un défi
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId, progress, action } = body

    if (!userId || !challengeId) {
      return NextResponse.json({ error: 'userId et challengeId requis' }, { status: 400 })
    }

    if (action === 'claim_reward') {
      // Réclamer une récompense
      const { error } = await supabase
        .from('user_challenges')
        .update({ 
          reward_claimed: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)

      if (error) {
        console.error('Erreur réclamation récompense:', error)
        return NextResponse.json({ error: 'Erreur réclamation récompense' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Récompense réclamée' })
    }

    // Mettre à jour la progression
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur vérification progression:', fetchError)
      return NextResponse.json({ error: 'Erreur vérification progression' }, { status: 500 })
    }

    // Récupérer les détails du défi pour vérifier si terminé
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('target_value')
      .eq('id', challengeId)
      .single()

    if (challengeError) {
      console.error('Erreur récupération défi:', challengeError)
      return NextResponse.json({ error: 'Erreur récupération défi' }, { status: 500 })
    }

    const isCompleted = progress >= challenge.target_value
    const completedAt = isCompleted ? new Date().toISOString() : null

    if (existingProgress) {
      // Mettre à jour la progression existante
      const { error } = await supabase
        .from('user_challenges')
        .update({
          current_progress: progress,
          is_completed: isCompleted,
          completed_at: completedAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)

      if (error) {
        console.error('Erreur mise à jour progression:', error)
        return NextResponse.json({ error: 'Erreur mise à jour progression' }, { status: 500 })
      }
    } else {
      // Créer une nouvelle progression
      const { error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          current_progress: progress,
          is_completed: isCompleted,
          completed_at: completedAt
        })

      if (error) {
        console.error('Erreur création progression:', error)
        return NextResponse.json({ error: 'Erreur création progression' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      completed: isCompleted,
      message: isCompleted ? 'Défi terminé !' : 'Progression mise à jour'
    })
  } catch (error) {
    console.error('Erreur API challenges POST:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 