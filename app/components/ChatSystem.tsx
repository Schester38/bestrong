'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, User, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'quiz'
  isRead: boolean
  choices?: QuizChoice[]
}

interface QuizChoice {
  id: string
  text: string
  action: string
}

interface ChatContact {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
}

interface ChatSystemProps {
  userId?: string
  className?: string
}

const ChatSystem = ({ userId, className = '' }: ChatSystemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger les contacts depuis l'API
  useEffect(() => {
    loadContacts()
  }, [userId])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      
      // Si pas d'userId, utiliser un ID par défaut
      const currentUserId = userId || 'guest-user'
      
      const response = await fetch(`/api/messages?userId=${currentUserId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.contacts) {
        const formattedContacts = data.contacts.map((c: any) => ({
          id: c.id,
          name: c.name,
          avatar: c.avatar,
          lastMessage: c.lastMessage || c.last_message?.content || '',
          lastMessageTime: new Date(c.lastMessageTime || c.last_message?.created_at || Date.now()),
          unreadCount: c.unreadCount || 0,
          isOnline: c.isOnline || false
        }))
        setContacts(formattedContacts)
      }
    } catch (error) {
      console.error('Erreur chargement contacts:', error)
      // Fallback vers les contacts de démonstration en cas d'erreur
      setContacts([
        {
          id: 'support',
          name: 'Support BE STRONG',
          avatar: '/support-avatar.png',
          lastMessage: 'Bonjour ! Comment puis-je vous aider ?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
          unreadCount: 1,
          isOnline: true
        },
        {
          id: 'community',
          name: 'Communauté BE STRONG',
          avatar: '/community-avatar.png',
          lastMessage: 'Nouveau défi disponible !',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
          unreadCount: 0,
          isOnline: false
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
    }
  }, [selectedContact])

  const loadMessages = async (contactId: string) => {
    try {
      setIsLoading(true)
      const currentUserId = userId || 'guest-user'
      
      const response = await fetch(`/api/messages?userId=${currentUserId}&contactId=${contactId}`)
      const data = await response.json()
      
      if (data.messages && data.messages.length > 0) {
        const formattedMessages = data.messages.map((m: any) => ({
          id: m.id,
          senderId: m.from_user,
          senderName: m.from_user === currentUserId ? 'Vous' : selectedContact?.name || 'Support',
          content: m.message,
          timestamp: new Date(m.created_at),
          type: 'text',
          isRead: true
        }))
        setMessages(formattedMessages)
      } else {
        // Si pas de messages, démarrer le quiz
        startQuiz(contactId)
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error)
      // Démarrer le quiz en cas d'erreur
      startQuiz(contactId)
    } finally {
      setIsLoading(false)
    }
  }

  const startQuiz = (contactId: string) => {
    const welcomeMessage: Message = {
      id: 'welcome',
      senderId: contactId,
      senderName: contactId === 'support' ? 'Support BE STRONG' : 'Communauté BE STRONG',
      content: contactId === 'support' 
        ? "🎉 Bienvenue sur BE STRONG ! Je suis ravi de vous rencontrer !\n\nJe vais vous guider pour découvrir toutes les fonctionnalités de notre plateforme. Que souhaitez-vous explorer en premier ?"
        : "👥 Bienvenue dans la communauté BE STRONG !\n\nNous sommes une communauté de créateurs qui s'entraident. Que voulez-vous découvrir ?",
      timestamp: new Date(),
      type: 'quiz',
      isRead: false,
      choices: contactId === 'support' ? [
        { id: 'credits', text: '💰 Les crédits et récompenses', action: 'credits' },
        { id: 'tasks', text: '📋 Les tâches quotidiennes', action: 'tasks' },
        { id: 'challenges', text: '🏆 Les défis spéciaux', action: 'challenges' },
        { id: 'social', text: '📱 Réseaux sociaux', action: 'social' },
        { id: 'help', text: '❓ J\'ai besoin d\'aide', action: 'help' }
      ] : [
        { id: 'events', text: '📅 Événements communautaires', action: 'events' },
        { id: 'tips', text: '💡 Conseils et astuces', action: 'tips' },
        { id: 'connect', text: '🤝 Rencontrer d\'autres membres', action: 'connect' },
        { id: 'share', text: '📤 Partager mes expériences', action: 'share' }
      ]
    }
    
    setMessages([welcomeMessage])
    setQuizStep(0)
  }

  const handleQuizChoice = async (choice: QuizChoice) => {
    const currentUserId = userId || 'guest-user'
    
    // Ajouter le choix de l'utilisateur
    const userChoice: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'Vous',
      content: choice.text,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }
    
    setMessages(prev => [...prev, userChoice])
    
    // Générer la réponse selon le choix
    setTimeout(async () => {
      const response = await generateQuizResponse(choice.action, selectedContact?.id || 'support')
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedContact?.id || 'support',
        senderName: selectedContact?.name || 'Support BE STRONG',
        content: response.content,
        timestamp: new Date(),
        type: response.choices ? 'quiz' : 'text',
        isRead: false,
        choices: response.choices
      }
      
      setMessages(prev => [...prev, botResponse])
      setQuizStep(prev => prev + 1)
    }, 1000)
  }

  const generateQuizResponse = async (action: string, contactId: string): Promise<{ content: string, choices?: QuizChoice[] }> => {
    const currentUserId = userId || 'guest-user'
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: contactId,
          content: `Quiz choice: ${action}`,
          type: 'quiz'
        })
      })

      const data = await response.json()
      
      if (data.autoReply) {
        return {
          content: data.autoReply.message || data.autoReply.content,
          choices: data.autoReply.choices
        }
      }
    } catch (error) {
      console.error('Erreur quiz response:', error)
    }
    
    // Fallback responses
    const responses: { [key: string]: { content: string, choices?: QuizChoice[] } } = {
      credits: {
        content: "💰 **Les crédits BE STRONG**\n\nLes crédits sont votre monnaie virtuelle ! Vous en gagnez en :\n• Complétant des tâches quotidiennes\n• Relevants des défis\n• Participant à la communauté\n\nQue voulez-vous savoir sur les crédits ?",
        choices: [
          { id: 'earn', text: '💡 Comment en gagner plus ?', action: 'earn_credits' },
          { id: 'use', text: '🛒 Comment les utiliser ?', action: 'use_credits' },
          { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
        ]
      },
      tasks: {
        content: "📋 **Les tâches quotidiennes**\n\nLes tâches sont vos objectifs quotidiens pour progresser ! Elles vous rapportent :\n• Des crédits\n• De l'expérience\n• Des badges\n\nQue voulez-vous découvrir ?",
        choices: [
          { id: 'daily', text: '📅 Tâches quotidiennes', action: 'daily_tasks' },
          { id: 'weekly', text: '📊 Tâches hebdomadaires', action: 'weekly_tasks' },
          { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
        ]
      },
      challenges: {
        content: "🏆 **Les défis spéciaux**\n\nLes défis sont des objectifs plus difficiles mais avec de meilleures récompenses !\n\nIls incluent :\n• Des compétitions\n• Des récompenses exclusives\n• Des badges rares",
        choices: [
          { id: 'current', text: '🎯 Défis actuels', action: 'current_challenges' },
          { id: 'rewards', text: '🎁 Récompenses', action: 'challenge_rewards' },
          { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
        ]
      },
      social: {
        content: "📱 **Réseaux sociaux**\n\nBE STRONG vous aide à optimiser votre présence sur :\n• TikTok\n• Instagram\n• YouTube\n• Et plus encore !\n\nQue voulez-vous apprendre ?",
        choices: [
          { id: 'tiktok', text: '🎵 TikTok', action: 'tiktok_tips' },
          { id: 'instagram', text: '📸 Instagram', action: 'instagram_tips' },
          { id: 'youtube', text: '🎬 YouTube', action: 'youtube_tips' },
          { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
        ]
      },
      help: {
        content: "❓ **Besoin d'aide ?**\n\nJe suis là pour vous aider ! Que souhaitez-vous faire ?",
        choices: [
          { id: 'account', text: '👤 Mon compte', action: 'account_help' },
          { id: 'technical', text: '🔧 Problème technique', action: 'technical_help' },
          { id: 'contact', text: '📞 Contacter l\'équipe', action: 'contact_team' }
        ]
      },
      next_topic: {
        content: "Parfait ! Que souhaitez-vous explorer maintenant ?",
        choices: [
          { id: 'credits', text: '💰 Les crédits et récompenses', action: 'credits' },
          { id: 'tasks', text: '📋 Les tâches quotidiennes', action: 'tasks' },
          { id: 'challenges', text: '🏆 Les défis spéciaux', action: 'challenges' },
          { id: 'social', text: '📱 Réseaux sociaux', action: 'social' },
          { id: 'finish', text: '✅ J\'ai fini, merci !', action: 'finish_quiz' }
        ]
      },
      finish_quiz: {
        content: "🎉 Parfait ! Vous connaissez maintenant les bases de BE STRONG !\n\nN'hésitez pas à revenir si vous avez d'autres questions. Bonne continuation ! 😊",
        choices: [
          { id: 'restart', text: '🔄 Recommencer le quiz', action: 'restart_quiz' },
          { id: 'chat', text: '💬 Chat libre', action: 'free_chat' }
        ]
      }
    }
    
    return responses[action] || {
      content: "Merci pour votre choix ! Que souhaitez-vous faire maintenant ?",
      choices: [
        { id: 'next', text: '➡️ Continuer', action: 'next_topic' },
        { id: 'finish', text: '✅ Terminer', action: 'finish_quiz' }
      ]
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    const messageContent = newMessage
    setNewMessage('')

    // Utiliser un userId par défaut si pas disponible
    const currentUserId = userId || 'guest-user'

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'Vous',
      content: messageContent,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    }

    setMessages(prev => [...prev, message])

    try {
      // Envoyer le message via l'API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedContact.id,
          content: messageContent,
          type: 'text'
        })
      })

      const data = await response.json()

      // Si une réponse automatique est générée, l'ajouter
      if (data.autoReply) {
        setTimeout(() => {
          // Gérer la date correctement
          let timestamp: Date;
          try {
            // Essayer d'abord created_at, puis timestamp, puis maintenant
            if (data.autoReply.created_at) {
              timestamp = new Date(data.autoReply.created_at);
            } else if (data.autoReply.timestamp) {
              timestamp = new Date(data.autoReply.timestamp);
            } else {
              timestamp = new Date();
            }
            
            // Vérifier si la date est valide
            if (isNaN(timestamp.getTime())) {
              timestamp = new Date();
            }
          } catch (error) {
            console.error('Erreur parsing date:', error);
            timestamp = new Date();
          }

          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContact.id,
            senderName: selectedContact.name,
            content: data.autoReply.message || data.autoReply.content || 'Réponse automatique',
            timestamp: timestamp,
            type: 'text',
            isRead: false
          }
          setMessages(prev => [...prev, autoReply])
        }, 1000)
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Hier'
    return date.toLocaleDateString()
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de chat flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        title="Support en ligne"
      >
        <MessageCircle className="w-6 h-6" />
        {contacts.some(c => c.unreadCount > 0) && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {contacts.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </button>

      {/* Panneau de chat flottant */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">
                💬 Support BE STRONG
              </h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-white/80 hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1 text-white/80 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {!selectedContact ? (
            /* Liste des contacts */
            <div className="max-h-80 overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {contact.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {contact.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatTime(contact.lastMessageTime)}
                      </p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Conversation */
            <div className="flex flex-col h-96">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === (userId || 'guest-user') ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.senderId === (userId || 'guest-user')
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Choix de quiz */}
                      {message.type === 'quiz' && message.choices && (
                        <div className="mt-3 space-y-2">
                          {message.choices.map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() => handleQuizChoice(choice)}
                              className="w-full text-left p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                            >
                              {choice.text}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-1 ${
                        message.senderId === (userId || 'guest-user') ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input pour chat libre */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton retour */}
          {selectedContact && (
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 left-4 text-white/80 hover:text-white transition-colors"
            >
              ← Retour
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatSystem 