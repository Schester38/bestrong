import { NextRequest, NextResponse } from 'next/server';
import { AIChatbot, ChatContext } from '@/app/utils/ai-chatbot';

// GET: Récupérer les messages d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const contactId = searchParams.get('contactId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID requis' }, { status: 400 });
    }

    // Si on demande les contacts
    if (!contactId) {
      const contacts = [
        {
          id: 'support',
          name: 'Support BE STRONG',
          avatar: '/support-avatar.png',
          lastMessage: 'Bonjour ! Comment puis-je vous aider ?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
          unreadCount: 0,
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
      ];

      return NextResponse.json({ contacts });
    }

    // Si on demande les messages d'un contact spécifique
    return NextResponse.json({ messages: [] });

  } catch (error) {
    console.error('Erreur API messages GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Envoyer un message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, type = 'text' } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'senderId, receiverId et content requis' }, { status: 400 });
    }

    // Créer le message de l'utilisateur
    const userMessage = {
      id: Date.now().toString(),
      from_user: senderId,
      to_user: receiverId,
      message: content,
      type: type,
      created_at: new Date().toISOString()
    };

    // Créer un contexte utilisateur de base
    const userContext: ChatContext = {
      userId: senderId,
      userLevel: 1,
      userCredits: 100,
      userStreak: 3,
      lastMessages: [],
      conversationHistory: []
    };

    // Générer une réponse automatique intelligente avec l'IA avancée
    let autoReplyContent: string;
    
    try {
      // Utiliser l'IA avancée
      autoReplyContent = await AIChatbot.generateContextualResponse(content, receiverId, userContext);
    } catch (aiError) {
      console.error('Erreur IA avancée, utilisation du système de base:', aiError);
      // Fallback vers un système simple
      autoReplyContent = generateSimpleResponse(content, receiverId);
    }
    
    // Créer la réponse automatique
    const autoReply = {
      id: (Date.now() + 1).toString(),
      from_user: receiverId,
      to_user: senderId,
      message: autoReplyContent,
      type: 'text',
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: userMessage,
      autoReply: autoReply
    });

  } catch (error) {
    console.error('Erreur API messages POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction de fallback simple enrichie
function generateSimpleResponse(message: string, contactId: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (contactId === 'support') {
    // Salutations
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello') || 
        lowerMessage.includes('hi') || lowerMessage.includes('coucou') || lowerMessage.includes('bonsoir')) {
      return "Bonjour ! Je suis l'assistant virtuel de BE STRONG. Comment puis-je vous aider aujourd'hui ? 😊";
    }
    
    // Crédits et monnaie
    if (lowerMessage.includes('crédit') || lowerMessage.includes('credit') || lowerMessage.includes('argent') || 
        lowerMessage.includes('monnaie') || lowerMessage.includes('gagner') || lowerMessage.includes('obtenir')) {
      return "Les crédits sont la monnaie virtuelle de BE STRONG. Vous en gagnez en complétant des tâches et des défis ! 💰";
    }
    
    // Tâches et missions
    if (lowerMessage.includes('tâche') || lowerMessage.includes('tache') || lowerMessage.includes('mission') || 
        lowerMessage.includes('activité') || lowerMessage.includes('objectif')) {
      return "Les tâches sont des activités quotidiennes qui vous aident à progresser. Vous les trouvez dans votre tableau de bord ! 📋";
    }
    
    // Défis et challenges
    if (lowerMessage.includes('défi') || lowerMessage.includes('defi') || lowerMessage.includes('challenge') || 
        lowerMessage.includes('compétition') || lowerMessage.includes('tournoi')) {
      return "Les défis sont des objectifs spéciaux avec des récompenses importantes ! 🏆";
    }
    
    // Badges et récompenses
    if (lowerMessage.includes('badge') || lowerMessage.includes('récompense') || lowerMessage.includes('recompense') || 
        lowerMessage.includes('trophée') || lowerMessage.includes('médaille')) {
      return "Les badges sont des récompenses que vous débloquez en atteignant certains objectifs ! 🎖️";
    }
    
    // Tableau de bord
    if (lowerMessage.includes('tableau') || lowerMessage.includes('dashboard') || lowerMessage.includes('profil') || 
        lowerMessage.includes('statistiques') || lowerMessage.includes('stats')) {
      return "Le tableau de bord est accessible depuis le bouton 'Tableau de bord' en haut de la page ! 📊";
    }
    
    // Connexion
    if (lowerMessage.includes('connexion') || lowerMessage.includes('connecter') || lowerMessage.includes('login') || 
        lowerMessage.includes('se connecter') || lowerMessage.includes('mot de passe')) {
      return "Pour vous connecter, utilisez votre numéro de téléphone et votre mot de passe ! 🔐";
    }
    
    // Problèmes techniques
    if (lowerMessage.includes('problème') || lowerMessage.includes('erreur') || lowerMessage.includes('bug') || 
        lowerMessage.includes('marche pas') || lowerMessage.includes('dysfonctionnement')) {
      return "Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? 🔧";
    }
    
    // Paiements
    if (lowerMessage.includes('payer') || lowerMessage.includes('paiement') || lowerMessage.includes('abonnement') || 
        lowerMessage.includes('premium') || lowerMessage.includes('tarif')) {
      return "BE STRONG propose des abonnements premium avec des fonctionnalités avancées ! 💳";
    }
    
    // Inscription
    if (lowerMessage.includes('inscription') || lowerMessage.includes('inscrire') || lowerMessage.includes('compte') || 
        lowerMessage.includes('créer') || lowerMessage.includes('nouveau')) {
      return "Pour vous inscrire, cliquez sur le bouton 'S'inscrire' en haut à droite de la page d'accueil ! 🎉";
    }
    
    // Réseaux sociaux
    if (lowerMessage.includes('tiktok') || lowerMessage.includes('instagram') || lowerMessage.includes('youtube') || 
        lowerMessage.includes('réseau') || lowerMessage.includes('social')) {
      return "BE STRONG vous aide à optimiser votre présence sur tous les réseaux sociaux ! 📱";
    }
    
    // Création de contenu
    if (lowerMessage.includes('contenu') || lowerMessage.includes('vidéo') || lowerMessage.includes('photo') || 
        lowerMessage.includes('créer') || lowerMessage.includes('publier')) {
      return "BE STRONG vous aide à créer du contenu de qualité ! 🎬";
    }
    
    // Audience et followers
    if (lowerMessage.includes('followers') || lowerMessage.includes('abonnés') || lowerMessage.includes('audience') || 
        lowerMessage.includes('vues') || lowerMessage.includes('likes')) {
      return "Développez votre audience avec BE STRONG ! 👥";
    }
    
    // Questions sur BE STRONG
    if (lowerMessage.includes('be strong') || lowerMessage.includes('qu\'est-ce') || lowerMessage.includes('c\'est quoi') || 
        lowerMessage.includes('définition') || lowerMessage.includes('explication')) {
      return "BE STRONG est une plateforme qui vous aide à maximiser votre présence sur les réseaux sociaux ! 💪";
    }
    
    // Merci
    if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
      return "De rien ! C'est un plaisir de vous aider ! 😊";
    }
    
    return "Merci pour votre message ! Notre équipe de support vous répondra dans les plus brefs délais. 📞";
  }
  
  if (contactId === 'community') {
    // Questions sur la communauté
    if (lowerMessage.includes('communauté') || lowerMessage.includes('communaute') || lowerMessage.includes('membre') || 
        lowerMessage.includes('groupe') || lowerMessage.includes('équipe')) {
      return "Bienvenue dans la communauté BE STRONG ! Nous sommes une communauté de créateurs qui s'entraident ! 👥";
    }
    
    // Défis communautaires
    if (lowerMessage.includes('défi') || lowerMessage.includes('defi') || lowerMessage.includes('challenge') || 
        lowerMessage.includes('compétition') || lowerMessage.includes('tournoi')) {
      return "Un nouveau défi communautaire est disponible ! Rejoignez d'autres membres ! 🎯";
    }
    
    // Événements
    if (lowerMessage.includes('événement') || lowerMessage.includes('evenement') || lowerMessage.includes('live') || 
        lowerMessage.includes('direct') || lowerMessage.includes('stream')) {
      return "Nous organisons régulièrement des événements en direct avec des experts ! 📅";
    }
    
    // Conseils
    if (lowerMessage.includes('conseil') || lowerMessage.includes('astuce') || lowerMessage.includes('tip') || 
        lowerMessage.includes('suggestion') || lowerMessage.includes('aide')) {
      return "La communauté partage quotidiennement des conseils et astuces ! 💡";
    }
    
    return "Merci pour votre message ! La communauté BE STRONG est là pour vous soutenir ! 🌟";
  }
  
  return "Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais.";
} 