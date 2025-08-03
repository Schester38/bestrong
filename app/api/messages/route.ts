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
    let autoReplyChoices: any[] = [];
    
    // Si c'est un choix de quiz, générer une réponse spéciale
    if (type === 'quiz' && content.startsWith('Quiz choice:')) {
      const choice = content.replace('Quiz choice: ', '');
      const quizResponse = generateQuizResponse(choice, receiverId);
      autoReplyContent = quizResponse.content;
      autoReplyChoices = quizResponse.choices || [];
    } else {
      try {
        // Utiliser l'IA avancée
        autoReplyContent = await AIChatbot.generateContextualResponse(content, receiverId, userContext);
      } catch (aiError) {
        console.error('Erreur IA avancée, utilisation du système de base:', aiError);
        // Fallback vers un système simple
        autoReplyContent = generateSimpleResponse(content, receiverId);
      }
    }
    
    // Créer la réponse automatique
    const autoReply = {
      id: (Date.now() + 1).toString(),
      from_user: receiverId,
      to_user: senderId,
      message: autoReplyContent,
      type: 'text',
      created_at: new Date().toISOString(),
      choices: autoReplyChoices
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

// Fonction pour générer des réponses de quiz
function generateQuizResponse(choice: string, contactId: string): { content: string, choices?: any[] } {
  const responses: { [key: string]: { content: string, choices?: any[] } } = {
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
    earn_credits: {
      content: "💡 **Comment gagner plus de crédits ?**\n\nVoici les meilleures façons :\n\n1️⃣ **Tâches quotidiennes** : +10-50 crédits/jour\n2️⃣ **Défis spéciaux** : +100-500 crédits\n3️⃣ **Participation communautaire** : +5-25 crédits\n4️⃣ **Streak quotidien** : Bonus progressif\n5️⃣ **Inviter des amis** : +50 crédits/ami\n\nVoulez-vous en savoir plus ?",
      choices: [
        { id: 'use_credits', text: '🛒 Comment utiliser mes crédits ?', action: 'use_credits' },
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    use_credits: {
      content: "🛒 **Comment utiliser vos crédits ?**\n\nVos crédits vous permettent de :\n\n🎨 **Fonctionnalités premium**\n• Outils de montage avancés\n• Templates exclusifs\n• Analyses détaillées\n\n🎁 **Récompenses spéciales**\n• Badges rares\n• Avatars personnalisés\n• Accès VIP\n\n💎 **Abonnements**\n• Réductions sur les abonnements\n• Contenu exclusif\n• Support prioritaire",
      choices: [
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    daily_tasks: {
      content: "📅 **Tâches quotidiennes**\n\nChaque jour, vous avez accès à :\n\n🌅 **Tâches matinales** (6h-12h)\n• Poster une story\n• Interagir avec 5 posts\n• Compléter un mini-défi\n\n🌆 **Tâches d'après-midi** (12h-18h)\n• Créer du contenu\n• Participer à un challenge\n• Aider un autre membre\n\n🌙 **Tâches du soir** (18h-24h)\n• Analyser vos statistiques\n• Planifier le lendemain\n• Partager vos succès",
      choices: [
        { id: 'weekly_tasks', text: '📊 Tâches hebdomadaires', action: 'weekly_tasks' },
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    weekly_tasks: {
      content: "📊 **Tâches hebdomadaires**\n\nChaque semaine, des objectifs plus ambitieux :\n\n🎯 **Objectifs de croissance**\n• Gagner 100 nouveaux followers\n• Créer 7 posts de qualité\n• Atteindre 1000 vues totales\n\n🏆 **Défis spéciaux**\n• Participer à un concours\n• Collaborer avec un autre créateur\n• Créer un contenu viral\n\n📈 **Analyses approfondies**\n• Revoir vos performances\n• Optimiser votre stratégie\n• Planifier la semaine suivante",
      choices: [
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    current_challenges: {
      content: "🎯 **Défis actuels**\n\nVoici les défis en cours :\n\n🔥 **Défi Viral** (7 jours)\n• Créer un contenu qui atteint 10k vues\n• Récompense : 500 crédits + badge \"Viral\"\n\n💪 **Défi Streak** (30 jours)\n• Être actif 30 jours consécutifs\n• Récompense : 1000 crédits + badge \"Déterminé\"\n\n🌟 **Défi Communauté** (14 jours)\n• Aider 50 autres membres\n• Récompense : 300 crédits + badge \"Bienveillant\"\n\nVoulez-vous participer ?",
      choices: [
        { id: 'challenge_rewards', text: '🎁 Voir toutes les récompenses', action: 'challenge_rewards' },
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    challenge_rewards: {
      content: "🎁 **Récompenses des défis**\n\nLes défis offrent des récompenses exceptionnelles :\n\n💰 **Crédits**\n• Défis simples : 50-200 crédits\n• Défis moyens : 200-500 crédits\n• Défis difficiles : 500-1000+ crédits\n\n🏅 **Badges exclusifs**\n• Badges animés\n• Badges rares\n• Badges de collection\n\n🎯 **Accès VIP**\n• Contenu exclusif\n• Outils premium\n• Support prioritaire\n\n🌟 **Reconnaissance**\n• Profil mis en avant\n• Mentions spéciales\n• Opportunités de collaboration",
      choices: [
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    tiktok_tips: {
      content: "🎵 **Conseils TikTok**\n\nPour réussir sur TikTok :\n\n📱 **Optimisation du contenu**\n• Vidéos courtes (15-60 secondes)\n• Début accrocheur (3 premières secondes)\n• Hashtags populaires mais pertinents\n• Sons tendance\n\n⏰ **Timing optimal**\n• 12h-14h (pause déjeuner)\n• 18h-22h (soirée)\n• Week-ends (plus d'engagement)\n\n🎯 **Stratégie de croissance**\n• Poster 1-3 fois par jour\n• Interagir avec les commentaires\n• Collaborer avec d'autres créateurs\n• Analyser vos statistiques",
      choices: [
        { id: 'instagram_tips', text: '📸 Conseils Instagram', action: 'instagram_tips' },
        { id: 'youtube_tips', text: '🎬 Conseils YouTube', action: 'youtube_tips' },
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    instagram_tips: {
      content: "📸 **Conseils Instagram**\n\nPour maximiser votre présence Instagram :\n\n📷 **Contenu de qualité**\n• Photos avec bonne lumière\n• Stories engageantes\n• Reels courts et dynamiques\n• IGTV pour du contenu long\n\n📊 **Stratégie de publication**\n• 1-2 posts par jour\n• Stories quotidiennes\n• Reels 3-4 fois par semaine\n• Lives réguliers\n\n🎯 **Engagement**\n• Répondre aux commentaires\n• Utiliser les sondages Stories\n• Collaborer avec des influenceurs\n• Participer aux tendances",
      choices: [
        { id: 'youtube_tips', text: '🎬 Conseils YouTube', action: 'youtube_tips' },
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    youtube_tips: {
      content: "🎬 **Conseils YouTube**\n\nPour réussir sur YouTube :\n\n🎥 **Qualité du contenu**\n• Thumbnails accrocheurs\n• Titres optimisés SEO\n• Descriptions détaillées\n• Tags pertinents\n\n⏱️ **Optimisation**\n• Vidéos de 8-15 minutes\n• Rétention d'audience > 60%\n• Call-to-action dans les vidéos\n• Playlists thématiques\n\n📈 **Croissance**\n• Posting régulier (2-3 fois/semaine)\n• Collaboration avec d'autres créateurs\n• Promotion cross-platform\n• Analyse des analytics",
      choices: [
        { id: 'next', text: '➡️ Passer au suivant', action: 'next_topic' }
      ]
    },
    account_help: {
      content: "👤 **Aide pour votre compte**\n\nBesoin d'aide avec votre compte ?\n\n🔐 **Connexion**\n• Mot de passe oublié\n• Problème de connexion\n• Changement d'email/téléphone\n\n⚙️ **Paramètres**\n• Modification du profil\n• Changement de mot de passe\n• Paramètres de confidentialité\n\n📱 **Application**\n• Problème technique\n• Bug ou dysfonctionnement\n• Mise à jour nécessaire",
      choices: [
        { id: 'technical_help', text: '🔧 Problème technique', action: 'technical_help' },
        { id: 'contact_team', text: '📞 Contacter l\'équipe', action: 'contact_team' }
      ]
    },
    technical_help: {
      content: "🔧 **Aide technique**\n\nProblème technique ? Voici les solutions :\n\n📱 **Problèmes courants**\n• Rafraîchir la page\n• Vider le cache\n• Redémarrer l'application\n• Vérifier votre connexion\n\n🔄 **Solutions rapides**\n• Se déconnecter/reconnecter\n• Utiliser un autre navigateur\n• Désactiver les extensions\n• Vérifier les mises à jour\n\n📞 **Si le problème persiste**\n• Décrivez le problème en détail\n• Incluez des captures d'écran\n• Précisez votre appareil/navigateur",
      choices: [
        { id: 'contact_team', text: '📞 Contacter l\'équipe', action: 'contact_team' }
      ]
    },
    contact_team: {
      content: "📞 **Contacter l'équipe**\n\nNotre équipe est là pour vous aider !\n\n📧 **Par email**\n• support@bestrong.com\n• Réponse sous 24h\n\n💬 **Chat en direct**\n• Disponible 7j/7\n• 9h-18h (heure française)\n\n📱 **Réseaux sociaux**\n• Instagram : @bestrong_support\n• Twitter : @BE_STRONG_Help\n\n⏰ **Temps de réponse**\n• Urgences : < 2h\n• Questions générales : < 24h\n• Suggestions : < 48h",
      choices: [
        { id: 'next', text: '➡️ Retour au menu', action: 'next_topic' }
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
    },
    restart_quiz: {
      content: "🔄 **Quiz redémarré !**\n\nQue souhaitez-vous explorer en premier ?",
      choices: [
        { id: 'credits', text: '💰 Les crédits et récompenses', action: 'credits' },
        { id: 'tasks', text: '📋 Les tâches quotidiennes', action: 'tasks' },
        { id: 'challenges', text: '🏆 Les défis spéciaux', action: 'challenges' },
        { id: 'social', text: '📱 Réseaux sociaux', action: 'social' },
        { id: 'help', text: '❓ J\'ai besoin d\'aide', action: 'help' }
      ]
    },
    free_chat: {
      content: "💬 **Chat libre activé !**\n\nVous pouvez maintenant me poser toutes vos questions librement. Je suis là pour vous aider ! 😊",
      choices: []
    }
  };
  
  return responses[choice] || {
    content: "Merci pour votre choix ! Que souhaitez-vous faire maintenant ?",
    choices: [
      { id: 'next', text: '➡️ Continuer', action: 'next_topic' },
      { id: 'finish', text: '✅ Terminer', action: 'finish_quiz' }
    ]
  };
} 