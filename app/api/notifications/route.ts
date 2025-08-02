import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { IntelligentAlgorithm } from '../../utils/intelligent-algorithm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Récupérer les notifications depuis la base de données
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Erreur récupération notifications:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Si pas de notifications en base, utiliser l'algorithme intelligent
    if (!notifications || notifications.length === 0) {
      try {
        // Générer des notifications intelligentes
        const intelligentNotifications = await IntelligentAlgorithm.generateIntelligentNotifications(userId)
        
        // Créer les notifications en base de données
        for (const notification of intelligentNotifications) {
          await IntelligentAlgorithm.createNotification(userId, notification)
        }
        
        // Retourner les notifications générées
        return NextResponse.json({ 
          notifications: intelligentNotifications.map((n, index) => ({
            id: `intelligent-${index}`,
            type: n.type,
            title: n.title,
            message: n.message,
            priority: n.priority,
            read: false,
            created_at: new Date().toISOString(),
            action_url: n.action_url
          }))
        })
      } catch (error) {
        console.error('Erreur génération notifications intelligentes:', error)
        
        // Fallback vers des notifications simples
        const fallbackNotifications = [
          {
            id: 'welcome',
            type: 'system',
            title: 'Bienvenue sur BE STRONG !',
            message: 'Commencez votre parcours en complétant votre première tâche.',
            priority: 'high',
            read: false,
            created_at: new Date().toISOString(),
            action_url: '/dashboard?tab=tasks'
          }
        ]
        
        return NextResponse.json({ notifications: fallbackNotifications })
      }
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Erreur API notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, priority = 'medium', actionUrl } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority,
        action_url: actionUrl,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création notification:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ notification: data })
  } catch (error) {
    console.error('Erreur API notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, read } = body

    if (!notificationId) {
      return NextResponse.json({ error: 'ID de notification requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) {
      console.error('Erreur mise à jour notification:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ notification: data })
  } catch (error) {
    console.error('Erreur API notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 