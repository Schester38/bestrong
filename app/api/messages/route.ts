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
    const contactId = searchParams.get('contactId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (contactId) {
      // Récupérer les messages d'une conversation spécifique
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erreur récupération messages:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
      }

      return NextResponse.json({ messages: messages || [] })
    } else {
      // Récupérer les contacts avec leurs derniers messages
      const { data: contacts, error } = await supabase
        .from('message_contacts')
        .select(`
          *,
          last_message:messages!inner(
            content,
            created_at,
            sender_id,
            receiver_id
          )
        `)
        .eq('user_id', userId)
        .order('last_message.created_at', { ascending: false })

      if (error) {
        console.error('Erreur récupération contacts:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
      }

      // Si pas de contacts en base, créer des contacts par défaut
      if (!contacts || contacts.length === 0) {
        const defaultContacts = [
          {
            id: 'support',
            name: 'Support BE STRONG',
            avatar: null,
            lastMessage: 'Comment puis-je vous aider ?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            unreadCount: 0,
            isOnline: true,
            type: 'support'
          },
          {
            id: 'community',
            name: 'Communauté TikTok',
            avatar: null,
            lastMessage: 'Nouvelle tâche disponible !',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            unreadCount: 0,
            isOnline: true,
            type: 'community'
          },
          {
            id: 'admin',
            name: 'Admin Gadar',
            avatar: null,
            lastMessage: 'Merci pour votre participation !',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            unreadCount: 0,
            isOnline: false,
            type: 'admin'
          }
        ]

        return NextResponse.json({ contacts: defaultContacts })
      }

      return NextResponse.json({ contacts })
    }
  } catch (error) {
    console.error('Erreur API messages:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content, type = 'text' } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Créer le message de l'utilisateur
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        type,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur création message:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Si le message est envoyé à un contact système, générer une réponse intelligente
    if (receiverId === 'support' || receiverId === 'admin' || receiverId === 'community') {
      try {
        // Analyser le comportement utilisateur
        const userBehavior = await IntelligentAlgorithm.analyzeUserBehavior(senderId)
        const userLevel = IntelligentAlgorithm.analyzeUserLevel(userBehavior)
        
        // Créer le contexte du message
        const messageContext = {
          userQuery: content,
          userHistory: [],
          userLevel,
          supportNeeded: content.toLowerCase().includes('problème') || content.toLowerCase().includes('erreur')
        }
        
        // Générer une réponse intelligente
        const intelligentResponse = IntelligentAlgorithm.generateIntelligentResponse(messageContext)
        
        // Créer la réponse automatique
        await IntelligentAlgorithm.createMessage(receiverId, senderId, intelligentResponse)
        
        // Retourner le message original + la réponse automatique
        return NextResponse.json({ 
          message: data,
          autoReply: {
            content: intelligentResponse,
            timestamp: new Date().toISOString()
          }
        })
      } catch (error) {
        console.error('Erreur génération réponse intelligente:', error)
        // En cas d'erreur, retourner juste le message original
        return NextResponse.json({ message: data })
      }
    }

    return NextResponse.json({ message: data })
  } catch (error) {
    console.error('Erreur API messages:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 