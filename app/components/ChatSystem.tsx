'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, User, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
  isRead: boolean
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Charger les contacts depuis l'API
  useEffect(() => {
    if (userId) {
      // Temporairement désactivé pour éviter les erreurs de fetch
      // loadContacts()
      
      // Utiliser des contacts de démonstration à la place
      setContacts([
        {
          id: 'support',
          name: 'Support BE STRONG',
          avatar: '/support-avatar.png',
          lastMessage: 'Bonjour ! Comment puis-je vous aider ?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          unreadCount: 1,
          isOnline: true
        },
        {
          id: 'community',
          name: 'Communauté BE STRONG',
          avatar: '/community-avatar.png',
          lastMessage: 'Nouveau défi disponible !',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          unreadCount: 0,
          isOnline: false
        }
      ])
      setIsLoading(false)
    }
  }, [userId])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?userId=${userId}`)
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
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (contactId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages?userId=${userId}&contactId=${contactId}`)
      const data = await response.json()
      
      if (data.messages) {
        const formattedMessages = data.messages.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_id === userId ? 'Vous' : selectedContact?.name || 'Contact',
          content: m.content,
          timestamp: new Date(m.created_at),
          type: m.type || 'text',
          isRead: m.is_read || true
        }))
        setMessages(formattedMessages)
      } else {
        // Messages par défaut si pas de messages en base
        const defaultMessages: Message[] = [
          {
            id: '1',
            senderId: contactId,
            senderName: selectedContact?.name || 'Contact',
            content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            type: 'text',
            isRead: true
          }
        ]
        setMessages(defaultMessages)
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error)
      // Messages par défaut en cas d'erreur
      const defaultMessages: Message[] = [
        {
          id: '1',
          senderId: contactId,
          senderName: selectedContact?.name || 'Contact',
          content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'text',
          isRead: true
        }
      ]
      setMessages(defaultMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !userId) return

    const messageContent = newMessage
    setNewMessage('')

    const message: Message = {
      id: Date.now().toString(),
      senderId: userId,
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
          senderId: userId,
          receiverId: selectedContact.id,
          content: messageContent,
          type: 'text'
        })
      })

      const data = await response.json()

      // Si une réponse automatique est générée, l'ajouter
      if (data.autoReply) {
        setTimeout(() => {
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContact.id,
            senderName: selectedContact.name,
            content: data.autoReply.content,
            timestamp: new Date(data.autoReply.timestamp),
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
      {/* Bouton de chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
        {contacts.some(c => c.unreadCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {contacts.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        )}
      </button>

      {/* Panneau de chat */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Messages
              </h3>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {!selectedContact ? (
            /* Liste des contacts */
            <div className="max-h-96 overflow-y-auto">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {contact.lastMessage}
                      </p>
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Chat avec contact sélectionné */
            <div className="flex flex-col h-96">
              {/* Header du chat */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ←
                    </button>
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {selectedContact.name.charAt(0)}
                        </span>
                      </div>
                      {selectedContact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {selectedContact.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedContact.isOnline ? 'En ligne' : 'Hors ligne'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.senderId === userId
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === userId
                            ? 'text-pink-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <Smile className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-purple-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatSystem 