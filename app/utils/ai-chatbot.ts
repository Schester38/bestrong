export interface ChatContext {
  userId: string
  userLevel: number
  userCredits: number
  userStreak: number
  lastMessages: string[]
  conversationHistory: Message[]
}

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
}

export class AIChatbot {
  // Analyser le sentiment d'un message
  static analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'merci', 'super', 'génial', 'excellent', 'parfait', 'bon', 'bien', 'cool', 'sympa',
      'j\'aime', 'adore', 'fantastique', 'incroyable', 'formidable', 'extraordinaire',
      'top', 'génial', 'magnifique', 'sublime', 'exceptionnel', 'remarquable',
      'chouette', 'agréable', 'plaisant', 'satisfait', 'content', 'heureux', 'ravi',
      'enthousiaste', 'motivé', 'inspiré', 'créatif', 'innovant', 'révolutionnaire'
    ]
    
    const negativeWords = [
      'problème', 'erreur', 'bug', 'marche pas', 'nul', 'mauvais', 'déçu', 'fâché',
      'énervé', 'frustré', 'difficile', 'compliqué', 'impossible', 'cassé',
      'horrible', 'terrible', 'épouvantable', 'désastreux', 'catastrophique',
      'ennuyeux', 'fatigant', 'stressant', 'anxiogène', 'déprimant', 'décourageant',
      'décevant', 'insatisfait', 'mécontent', 'fâché', 'irrité', 'exaspéré'
    ]
    
    const lowerMessage = message.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // Analyser l'intention du message
  static analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('comment') || lowerMessage.includes('comment faire') || lowerMessage.includes('comment procéder')) {
      return 'how_to'
    }
    
    if (lowerMessage.includes('pourquoi') || lowerMessage.includes('pour quoi') || lowerMessage.includes('raison')) {
      return 'why'
    }
    
    if (lowerMessage.includes('quand') || lowerMessage.includes('quand est-ce') || lowerMessage.includes('date') || lowerMessage.includes('horaire')) {
      return 'when'
    }
    
    if (lowerMessage.includes('où') || lowerMessage.includes('ou') || lowerMessage.includes('lieu') || lowerMessage.includes('endroit')) {
      return 'where'
    }
    
    if (lowerMessage.includes('combien') || lowerMessage.includes('prix') || lowerMessage.includes('coût') || lowerMessage.includes('tarif') || lowerMessage.includes('montant')) {
      return 'how_much'
    }
    
    if (lowerMessage.includes('aide') || lowerMessage.includes('problème') || lowerMessage.includes('erreur') || lowerMessage.includes('soutien') || lowerMessage.includes('assistance')) {
      return 'help'
    }
    
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('coucou')) {
      return 'greeting'
    }
    
    if (lowerMessage.includes('au revoir') || lowerMessage.includes('bye') || lowerMessage.includes('ciao') || lowerMessage.includes('à bientôt') || lowerMessage.includes('à plus')) {
      return 'goodbye'
    }
    
    if (lowerMessage.includes('merci') || lowerMessage.includes('thanks') || lowerMessage.includes('gracie')) {
      return 'thanks'
    }
    
    return 'general'
  }

  // Générer une réponse contextuelle intelligente
  static async generateContextualResponse(
    message: string, 
    contactId: string, 
    context: ChatContext
  ): Promise<string> {
    const sentiment = this.analyzeSentiment(message)
    const intent = this.analyzeIntent(message)
    const lowerMessage = message.toLowerCase()
    
    // Réponses personnalisées basées sur le contexte utilisateur
    if (contactId === 'support') {
      return this.generatePersonalizedSupportResponse(message, sentiment, intent, context)
    }
    
    if (contactId === 'community') {
      return this.generatePersonalizedCommunityResponse(message, sentiment, intent, context)
    }
    
    return this.generateDefaultResponse(message, sentiment, intent)
  }

  private static generatePersonalizedSupportResponse(
    message: string, 
    sentiment: string, 
    intent: string, 
    context: ChatContext
  ): string {
    const lowerMessage = message.toLowerCase()
    
    // Réponses personnalisées basées sur le niveau utilisateur
    if (context.userLevel < 3) {
      if (lowerMessage.includes('défi') || lowerMessage.includes('defi') || lowerMessage.includes('challenge')) {
        return `En tant que débutant (niveau ${context.userLevel}), je vous recommande de commencer par les tâches simples avant de vous lancer dans les défis. Concentrez-vous d'abord sur l'exploration de la plateforme ! 🌱`;
      }
    }
    
    if (context.userLevel >= 10) {
      if (lowerMessage.includes('progression') || lowerMessage.includes('niveau') || lowerMessage.includes('avancement')) {
        return `Félicitations ! Avec votre niveau ${context.userLevel}, vous êtes un utilisateur expérimenté. Vous avez débloqué toutes les fonctionnalités avancées. Continuez comme ça ! 🏆`;
      }
    }
    
    // Réponses basées sur les crédits
    if (context.userCredits < 50) {
      if (lowerMessage.includes('crédit') || lowerMessage.includes('credit') || lowerMessage.includes('argent') || lowerMessage.includes('monnaie')) {
        return `Je vois que vous avez ${context.userCredits} crédits. Pour en gagner plus rapidement, complétez les tâches quotidiennes et participez aux défis ! 💰`;
      }
    }
    
    // Réponses basées sur le streak
    if (context.userStreak >= 7) {
      if (lowerMessage.includes('motivation') || lowerMessage.includes('continuer') || lowerMessage.includes('persévérer')) {
        return `Impressionnant ! Vous êtes actif depuis ${context.userStreak} jours consécutifs. Cette régularité vous rapporte des bonus spéciaux ! 🔥`;
      }
    }
    
    // Réponses basées sur le sentiment
    if (sentiment === 'negative') {
      return "Je comprends votre frustration. Laissez-moi vous aider à résoudre ce problème. Pouvez-vous me donner plus de détails ? Notre équipe est là pour vous soutenir ! 🤝";
    }
    
    if (sentiment === 'positive') {
      return "Je suis ravi que vous soyez satisfait ! Continuez comme ça et n'hésitez pas si vous avez d'autres questions. Votre enthousiasme nous motive ! 😊";
    }
    
    // Réponses basées sur l'intention
    switch (intent) {
      case 'how_to':
        return "Je vais vous guider étape par étape. Pouvez-vous me préciser ce que vous souhaitez faire exactement ? 📋";
      
      case 'why':
        return "Excellente question ! Laissez-moi vous expliquer le raisonnement derrière cette fonctionnalité. 🔍";
      
      case 'when':
        return "Je vais vérifier les horaires et vous donner une réponse précise. ⏰";
      
      case 'where':
        return "Je vais vous indiquer exactement où trouver cette fonctionnalité. 🗺️";
      
      case 'how_much':
        return "Laissez-moi vous donner les détails sur les tarifs et les options disponibles. 💳";
      
      case 'help':
        return "Je suis là pour vous aider ! Décrivez-moi votre problème et je vais tout faire pour le résoudre. 🆘";
      
      case 'greeting':
        return `Bonjour ! Comment puis-je vous aider aujourd'hui ? Je vois que vous êtes niveau ${context.userLevel} avec ${context.userCredits} crédits. 😊`;
      
      case 'goodbye':
        return "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions. Bonne continuation ! 👋";
      
      case 'thanks':
        return "De rien ! C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions ! 😊";
      
      default:
        return this.generateSupportResponse(lowerMessage)
    }
  }

  private static generatePersonalizedCommunityResponse(
    message: string, 
    sentiment: string, 
    intent: string, 
    context: ChatContext
  ): string {
    const lowerMessage = message.toLowerCase()
    
    // Réponses personnalisées pour la communauté
    if (context.userLevel >= 5) {
      if (lowerMessage.includes('conseil') || lowerMessage.includes('astuce') || lowerMessage.includes('tip') || lowerMessage.includes('suggestion')) {
        return `Avec votre niveau ${context.userLevel}, vous pourriez partager vos propres conseils avec la communauté ! Votre expérience est précieuse. 💡`;
      }
    }
    
    if (context.userStreak >= 5) {
      if (lowerMessage.includes('motivation') || lowerMessage.includes('inspiration') || lowerMessage.includes('énergie')) {
        return `Votre streak de ${context.userStreak} jours inspire la communauté ! Partagez vos secrets de motivation avec les autres membres. 🔥`;
      }
    }
    
    // Réponses basées sur le sentiment
    if (sentiment === 'positive') {
      return "Votre enthousiasme est contagieux ! La communauté adore les membres positifs comme vous. Continuez à partager cette énergie ! 🌟";
    }
    
    return this.generateCommunityResponse(lowerMessage)
  }

  private static generateDefaultResponse(
    message: string, 
    sentiment: string, 
    intent: string
  ): string {
    if (sentiment === 'negative') {
      return "Je suis désolé d'entendre cela. Comment puis-je vous aider à améliorer la situation ? 🤝";
    }
    
    if (sentiment === 'positive') {
      return "Je suis ravi que vous soyez satisfait ! N'hésitez pas si vous avez d'autres questions. 😊";
    }
    
    return "Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais. 📞";
  }

  // Méthodes de base enrichies avec plus de mots-clés
  private static generateSupportResponse(message: string): string {
    // Inscription et compte
    if (message.includes('inscription') || message.includes('inscrire') || message.includes('compte') || 
        message.includes('créer') || message.includes('nouveau') || message.includes('s\'enregistrer')) {
      return "Pour vous inscrire, cliquez sur le bouton 'S'inscrire' en haut à droite de la page d'accueil. Vous aurez besoin de votre numéro de téléphone et d'un pseudo unique. 🎉";
    }

    // Crédits et monnaie
    if (message.includes('crédit') || message.includes('credit') || message.includes('argent') || 
        message.includes('monnaie') || message.includes('gagner') || message.includes('obtenir') ||
        message.includes('accumuler') || message.includes('collecter')) {
      return "Les crédits sont la monnaie virtuelle de BE STRONG. Vous en gagnez en complétant des tâches, des défis et en participant à la communauté. Vous pouvez les utiliser pour débloquer des fonctionnalités premium ! 💰";
    }

    // Tâches et missions
    if (message.includes('tâche') || message.includes('tache') || message.includes('mission') || 
        message.includes('activité') || message.includes('objectif') || message.includes('quête') ||
        message.includes('exercice') || message.includes('challenge quotidien')) {
      return "Les tâches sont des activités quotidiennes qui vous aident à progresser. Vous les trouvez dans votre tableau de bord. Chaque tâche complétée vous rapporte des crédits et de l'expérience ! 📋";
    }

    // Défis et challenges
    if (message.includes('défi') || message.includes('defi') || message.includes('challenge') || 
        message.includes('compétition') || message.includes('tournoi') || message.includes('épreuve') ||
        message.includes('test') || message.includes('évaluation')) {
      return "Les défis sont des objectifs spéciaux avec des récompenses importantes. Ils sont plus difficiles que les tâches normales mais offrent de meilleures récompenses ! 🏆";
    }

    // Badges et récompenses
    if (message.includes('badge') || message.includes('récompense') || message.includes('recompense') || 
        message.includes('trophée') || message.includes('médaille') || message.includes('accomplissement') ||
        message.includes('succès') || message.includes('réalisation')) {
      return "Les badges sont des récompenses que vous débloquez en atteignant certains objectifs. Ils apparaissent dans votre profil et montrent vos accomplissements ! 🎖️";
    }

    // Tableau de bord et profil
    if (message.includes('tableau') || message.includes('dashboard') || message.includes('profil') || 
        message.includes('statistiques') || message.includes('stats') || message.includes('progression') ||
        message.includes('historique') || message.includes('données')) {
      return "Le tableau de bord est accessible depuis le bouton 'Tableau de bord' en haut de la page. C'est là que vous trouvez vos statistiques, tâches, défis et badges ! 📊";
    }

    // Connexion et authentification
    if (message.includes('connexion') || message.includes('connecter') || message.includes('login') || 
        message.includes('se connecter') || message.includes('authentification') || message.includes('mot de passe') ||
        message.includes('identifiant') || message.includes('accès')) {
      return "Pour vous connecter, utilisez votre numéro de téléphone et votre mot de passe. Si vous avez oublié votre mot de passe, contactez-nous directement. 🔐";
    }

    // Problèmes techniques
    if (message.includes('problème') || message.includes('erreur') || message.includes('bug') || 
        message.includes('marche pas') || message.includes('dysfonctionnement') || message.includes('panne') ||
        message.includes('plantage') || message.includes('blocage') || message.includes('difficulté')) {
      return "Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? En attendant, essayez de rafraîchir la page ou de vous reconnecter. Si le problème persiste, notre équipe technique s'en occupera rapidement ! 🔧";
    }

    // Paiements et abonnements
    if (message.includes('payer') || message.includes('paiement') || message.includes('abonnement') || 
        message.includes('premium') || message.includes('tarif') || message.includes('prix') ||
        message.includes('facturation') || message.includes('carte') || message.includes('paypal')) {
      return "BE STRONG propose des abonnements premium avec des fonctionnalités avancées. Les détails et tarifs sont disponibles dans la section 'Tarifs' du site. 💳";
    }

    // Salutations
    if (message.includes('bonjour') || message.includes('salut') || message.includes('hello') || 
        message.includes('hi') || message.includes('coucou') || message.includes('bonsoir') ||
        message.includes('bonne journée') || message.includes('bonne soirée')) {
      return "Bonjour ! Je suis l'assistant virtuel de BE STRONG. Comment puis-je vous aider aujourd'hui ? 😊";
    }

    // Questions sur BE STRONG
    if (message.includes('be strong') || message.includes('qu\'est-ce') || message.includes('c\'est quoi') || 
        message.includes('définition') || message.includes('explication') || message.includes('présentation') ||
        message.includes('description') || message.includes('concept')) {
      return "BE STRONG est une plateforme qui vous aide à maximiser votre présence sur les réseaux sociaux. Nous proposons des outils, des défis et une communauté pour vous accompagner dans votre succès ! 💪";
    }

    // Réseaux sociaux
    if (message.includes('tiktok') || message.includes('instagram') || message.includes('youtube') || 
        message.includes('réseau') || message.includes('social') || message.includes('média') ||
        message.includes('plateforme') || message.includes('contenu')) {
      return "BE STRONG vous aide à optimiser votre présence sur tous les réseaux sociaux : TikTok, Instagram, YouTube, et plus encore ! Nous vous donnons les outils pour créer du contenu viral et développer votre audience. 📱";
    }

    // Création de contenu
    if (message.includes('contenu') || message.includes('vidéo') || message.includes('photo') || 
        message.includes('créer') || message.includes('publier') || message.includes('partager') ||
        message.includes('montage') || message.includes('édition')) {
      return "BE STRONG vous aide à créer du contenu de qualité ! Nous proposons des conseils, des outils de montage et des idées créatives pour vos vidéos et photos. 🎬";
    }

    // Audience et followers
    if (message.includes('followers') || message.includes('abonnés') || message.includes('audience') || 
        message.includes('communauté') || message.includes('fans') || message.includes('vues') ||
        message.includes('likes') || message.includes('engagement')) {
      return "Développez votre audience avec BE STRONG ! Nos outils vous aident à attirer plus de followers, augmenter vos vues et améliorer l'engagement de votre communauté. 👥";
    }

    // Réponse par défaut pour le support
    return "Merci pour votre message ! Notre équipe de support vous répondra dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ ou explorer le site pour trouver des réponses rapides. 📞";
  }

  private static generateCommunityResponse(message: string): string {
    // Questions sur la communauté
    if (message.includes('communauté') || message.includes('communaute') || message.includes('membre') || 
        message.includes('groupe') || message.includes('équipe') || message.includes('collectif')) {
      return "Bienvenue dans la communauté BE STRONG ! Nous sommes une communauté de créateurs qui s'entraident pour réussir. N'hésitez pas à partager vos expériences ! 👥";
    }

    // Questions sur les défis communautaires
    if (message.includes('défi') || message.includes('defi') || message.includes('challenge') || 
        message.includes('compétition') || message.includes('tournoi') || message.includes('épreuve')) {
      return "Un nouveau défi communautaire est disponible ! Rejoignez d'autres membres pour relever ce défi ensemble et gagner des récompenses exclusives ! 🎯";
    }

    // Questions sur les événements
    if (message.includes('événement') || message.includes('evenement') || message.includes('live') || 
        message.includes('direct') || message.includes('stream') || message.includes('webinaire') ||
        message.includes('conférence') || message.includes('atelier')) {
      return "Nous organisons régulièrement des événements en direct avec des experts. Restez connecté pour ne pas manquer nos prochains événements ! 📅";
    }

    // Questions sur les conseils
    if (message.includes('conseil') || message.includes('astuce') || message.includes('tip') || 
        message.includes('suggestion') || message.includes('recommandation') || message.includes('aide') ||
        message.includes('tutoriel') || message.includes('guide')) {
      return "La communauté partage quotidiennement des conseils et astuces. Consultez les messages récents ou posez votre question pour obtenir des conseils personnalisés ! 💡";
    }

    // Réponse par défaut pour la communauté
    return "Merci pour votre message ! La communauté BE STRONG est là pour vous soutenir. N'hésitez pas à participer aux discussions ! 🌟";
  }
} 