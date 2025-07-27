import { NextRequest, NextResponse } from 'next/server';
import { BEStrongAI } from '@/app/utils/ai-features';

const beStrongAI = new BEStrongAI();

export async function POST(request: NextRequest) {
  try {
    const examples = [
      {
        id: 1,
        title: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !',
        description: 'Découvre le secret des créateurs qui génèrent des millions de vues !',
        content: 'Tu veux savoir comment les pros font pour avoir autant de vues ? Voici la technique secrète que personne ne partage...',
        hashtags: ['#fyp', '#viral', '#secret', '#technique', '#tiktok'],
        bestTime: '18:00',
        predictedEngagement: 0.45,
        viralPotential: 95,
        musicSuggestions: ['Viral Beat', 'Trending Sound'],
        filterSuggestions: ['Vintage', 'Retro'],
        captionTemplate: '🔥 Cette technique va RÉVOLUTIONNER ton approche TikTok !\n\nDécouvre le secret des créateurs qui génèrent des millions de vues !\n\n#fyp #viral #secret #technique #tiktok'
      },
      {
        id: 2,
        title: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !',
        description: 'La vérité cachée sur les entraînements qui marchent vraiment !',
        content: 'Les influenceurs fitness te mentent ! Voici ce qui fonctionne vraiment pour transformer ton corps en 30 jours...',
        hashtags: ['#fitness', '#truth', '#exposed', '#workout', '#transformation'],
        bestTime: '07:00',
        predictedEngagement: 0.52,
        viralPotential: 98,
        musicSuggestions: ['Workout Beat', 'Motivation Mix'],
        filterSuggestions: ['Bright', 'Energetic'],
        captionTemplate: '💀 Ce que les GÉANTS du fitness ne veulent PAS que tu saches !\n\nLa vérité cachée sur les entraînements qui marchent vraiment !\n\n#fitness #truth #exposed #workout #transformation'
      },
      {
        id: 3,
        title: '⚡ Hack de productivité qui va DOUBLER tes résultats !',
        description: 'La méthode simple que j\'utilise pour être 10x plus efficace !',
        content: 'J\'ai testé toutes les techniques de productivité. Voici celle qui a changé ma vie et qui va changer la tienne...',
        hashtags: ['#productivity', '#hack', '#efficiency', '#success', '#tips'],
        bestTime: '12:00',
        predictedEngagement: 0.38,
        viralPotential: 87,
        musicSuggestions: ['Productive Vibes', 'Focus Mode'],
        filterSuggestions: ['Clean', 'Professional'],
        captionTemplate: '⚡ Hack de productivité qui va DOUBLER tes résultats !\n\nLa méthode simple que j\'utilise pour être 10x plus efficace !\n\n#productivity #hack #efficiency #success #tips'
      },
      {
        id: 4,
        title: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !',
        description: 'La stratégie que personne ne partage pour réussir en business !',
        content: 'J\'ai interviewé 50 entrepreneurs millionnaires. Voici le secret qu\'ils ont tous en commun...',
        hashtags: ['#business', '#success', '#entrepreneur', '#money', '#strategy'],
        bestTime: '20:00',
        predictedEngagement: 0.41,
        viralPotential: 92,
        musicSuggestions: ['Success Theme', 'Victory Mix'],
        filterSuggestions: ['Elegant', 'Sophisticated'],
        captionTemplate: '🎯 Le secret des entrepreneurs qui gagnent 100K+ par mois !\n\nLa stratégie que personne ne partage pour réussir en business !\n\n#business #success #entrepreneur #money #strategy'
      },
      {
        id: 5,
        title: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)',
        description: 'Comment j\'ai complètement changé ma vie en un mois !',
        content: 'Il y a 30 jours, j\'étais au plus bas. Aujourd\'hui, ma vie a complètement changé. Voici comment...',
        hashtags: ['#transformation', '#beforeafter', '#motivation', '#change', '#success'],
        bestTime: '21:00',
        predictedEngagement: 0.48,
        viralPotential: 96,
        musicSuggestions: ['Inspirational', 'Uplifting'],
        filterSuggestions: ['Warm', 'Golden'],
        captionTemplate: '🌟 Transformation COMPLÈTE en 30 jours (Avant/Après)\n\nComment j\'ai complètement changé ma vie en un mois !\n\n#transformation #beforeafter #motivation #change #success'
      },
      {
        id: 6,
        title: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !',
        description: 'Le piège que 90% des créateurs tombent dedans !',
        content: 'Tu fais probablement cette erreur sans le savoir. Voici comment l\'éviter et sauver ton compte...',
        hashtags: ['#tiktok', '#warning', '#mistake', '#tips', '#creator'],
        bestTime: '19:00',
        predictedEngagement: 0.55,
        viralPotential: 99,
        musicSuggestions: ['Warning Beat', 'Alert Sound'],
        filterSuggestions: ['Dark', 'Dramatic'],
        captionTemplate: '🚨 ALERTE : Cette erreur va RUINER ton compte TikTok !\n\nLe piège que 90% des créateurs tombent dedans !\n\n#tiktok #warning #mistake #tips #creator'
      },
      {
        id: 7,
        title: '💎 Le code secret des influenceurs millionnaires !',
        description: 'La formule mathématique du succès sur les réseaux sociaux !',
        content: 'J\'ai analysé 1000 influenceurs millionnaires. Voici la formule exacte qu\'ils utilisent tous...',
        hashtags: ['#influencer', '#millionaire', '#formula', '#success', '#secret'],
        bestTime: '16:00',
        predictedEngagement: 0.49,
        viralPotential: 94,
        musicSuggestions: ['Luxury Beat', 'Millionaire Mix'],
        filterSuggestions: ['Glamour', 'Sophisticated'],
        captionTemplate: '💎 Le code secret des influenceurs millionnaires !\n\nLa formule mathématique du succès sur les réseaux sociaux !\n\n#influencer #millionaire #formula #success #secret'
      },
      {
        id: 8,
        title: '⚡ Cette routine matinale va TRANSFORMER ta vie !',
        description: 'Le secret des gens qui réussissent avant 8h du matin !',
        content: 'Les gens qui réussissent ont tous la même routine matinale. Voici exactement ce qu\'ils font...',
        hashtags: ['#morning', '#routine', '#success', '#habits', '#motivation'],
        bestTime: '08:00',
        predictedEngagement: 0.42,
        viralPotential: 89,
        musicSuggestions: ['Morning Vibes', 'Fresh Start'],
        filterSuggestions: ['Bright', 'Natural'],
        captionTemplate: '⚡ Cette routine matinale va TRANSFORMER ta vie !\n\nLe secret des gens qui réussissent avant 8h du matin !\n\n#morning #routine #success #habits #motivation'
      },
      {
        id: 9,
        title: '🎭 La technique de manipulation que les pros utilisent !',
        description: 'Comment captiver ton audience en 3 secondes !',
        content: 'Les créateurs pros savent exactement comment captiver leur audience. Voici leur technique secrète...',
        hashtags: ['#psychology', '#manipulation', '#capture', '#audience', '#technique'],
        bestTime: '15:00',
        predictedEngagement: 0.51,
        viralPotential: 97,
        musicSuggestions: ['Mystery Beat', 'Intrigue Sound'],
        filterSuggestions: ['Mysterious', 'Dark'],
        captionTemplate: '🎭 La technique de manipulation que les pros utilisent !\n\nComment captiver ton audience en 3 secondes !\n\n#psychology #manipulation #capture #audience #technique'
      },
      {
        id: 10,
        title: '🔥 Le hack de motivation qui va TE RÉVEILLER !',
        description: 'La méthode pour rester motivé même quand tout va mal !',
        content: 'Quand tout va mal, les gens qui réussissent utilisent cette technique. Voici comment faire...',
        hashtags: ['#motivation', '#hack', '#mindset', '#resilience', '#success'],
        bestTime: '06:00',
        predictedEngagement: 0.47,
        viralPotential: 93,
        musicSuggestions: ['Motivation Mix', 'Wake Up Beat'],
        filterSuggestions: ['Energetic', 'Bright'],
        captionTemplate: '🔥 Le hack de motivation qui va TE RÉVEILLER !\n\nLa méthode pour rester motivé même quand tout va mal !\n\n#motivation #hack #mindset #resilience #success'
      },
      {
        id: 11,
        title: '💀 Ce que les BANQUES ne veulent PAS que tu découvres !',
        description: 'Le secret pour devenir riche sans emprunter !',
        content: 'Les banques te cachent cette information. Voici comment construire ta fortune sans leur aide...',
        hashtags: ['#money', '#banking', '#wealth', '#finance', '#secret'],
        bestTime: '14:00',
        predictedEngagement: 0.53,
        viralPotential: 98,
        musicSuggestions: ['Money Beat', 'Wealth Mix'],
        filterSuggestions: ['Golden', 'Luxury'],
        captionTemplate: '💀 Ce que les BANQUES ne veulent PAS que tu découvres !\n\nLe secret pour devenir riche sans emprunter !\n\n#money #banking #wealth #finance #secret'
      },
      {
        id: 12,
        title: '🌟 La méthode pour ATTEINDRE TES RÊVES en 90 jours !',
        description: 'Le plan d\'action que j\'ai utilisé pour réaliser mes objectifs !',
        content: 'J\'ai mis au point une méthode qui fonctionne à 100%. Voici exactement comment procéder...',
        hashtags: ['#dreams', '#goals', '#method', '#success', '#plan'],
        bestTime: '09:00',
        predictedEngagement: 0.44,
        viralPotential: 91,
        musicSuggestions: ['Dreamy Vibes', 'Inspiration Mix'],
        filterSuggestions: ['Soft', 'Warm'],
        captionTemplate: '🌟 La méthode pour ATTEINDRE TES RÊVES en 90 jours !\n\nLe plan d\'action que j\'ai utilisé pour réaliser mes objectifs !\n\n#dreams #goals #method #success #plan'
      },
      {
        id: 13,
        title: '🚨 ATTENTION : Cette habitude va TE TUER !',
        description: 'Le danger que 95% des gens ignorent !',
        content: 'Tu fais probablement cette chose tous les jours sans savoir qu\'elle te tue à petit feu...',
        hashtags: ['#health', '#warning', '#danger', '#habit', '#life'],
        bestTime: '17:00',
        predictedEngagement: 0.56,
        viralPotential: 99,
        musicSuggestions: ['Warning Sound', 'Danger Beat'],
        filterSuggestions: ['Dark', 'Dramatic'],
        captionTemplate: '🚨 ATTENTION : Cette habitude va TE TUER !\n\nLe danger que 95% des gens ignorent !\n\n#health #warning #danger #habit #life'
      },
      {
        id: 14,
        title: '💡 Le secret des génies que l\'école ne t\'apprend pas !',
        description: 'La technique de pensée qui va révolutionner ton cerveau !',
        content: 'Les génies pensent différemment. Voici la méthode qu\'ils utilisent pour résoudre tous les problèmes...',
        hashtags: ['#genius', '#thinking', '#mindset', '#intelligence', '#method'],
        bestTime: '11:00',
        predictedEngagement: 0.39,
        viralPotential: 88,
        musicSuggestions: ['Genius Beat', 'Intelligence Mix'],
        filterSuggestions: ['Clean', 'Professional'],
        captionTemplate: '💡 Le secret des génies que l\'école ne t\'apprend pas !\n\nLa technique de pensée qui va révolutionner ton cerveau !\n\n#genius #thinking #mindset #intelligence #method'
      },
      {
        id: 15,
        title: '🔥 Cette technique va TE RENDRE INARRÊTABLE !',
        description: 'Le secret des gens qui ne lâchent jamais rien !',
        content: 'Les gens qui réussissent ont tous cette qualité. Voici comment la développer en toi...',
        hashtags: ['#unstoppable', '#determination', '#success', '#mindset', '#power'],
        bestTime: '22:00',
        predictedEngagement: 0.50,
        viralPotential: 95,
        musicSuggestions: ['Power Beat', 'Unstoppable Mix'],
        filterSuggestions: ['Bold', 'Dynamic'],
        captionTemplate: '🔥 Cette technique va TE RENDRE INARRÊTABLE !\n\nLe secret des gens qui ne lâchent jamais rien !\n\n#unstoppable #determination #success #mindset #power'
      },
      {
        id: 16,
        title: '🎯 Le plan pour DEVENIR MILLIONNAIRE en 5 ans !',
        description: 'La stratégie étape par étape que j\'utilise !',
        content: 'J\'ai rencontré 100 millionnaires. Voici le plan exact qu\'ils ont tous suivi...',
        hashtags: ['#millionaire', '#plan', '#strategy', '#wealth', '#success'],
        bestTime: '13:00',
        predictedEngagement: 0.52,
        viralPotential: 96,
        musicSuggestions: ['Millionaire Beat', 'Wealth Mix'],
        filterSuggestions: ['Golden', 'Luxury'],
        captionTemplate: '🎯 Le plan pour DEVENIR MILLIONNAIRE en 5 ans !\n\nLa stratégie étape par étape que j\'utilise !\n\n#millionaire #plan #strategy #wealth #success'
      },
      {
        id: 17,
        title: '⚡ Cette erreur va DÉTRUIRE ton avenir !',
        description: 'Le piège que 80% des jeunes tombent dedans !',
        content: 'Tu fais probablement cette erreur sans le savoir. Voici comment l\'éviter et sauver ton avenir...',
        hashtags: ['#mistake', '#future', '#warning', '#youth', '#advice'],
        bestTime: '10:00',
        predictedEngagement: 0.54,
        viralPotential: 97,
        musicSuggestions: ['Warning Beat', 'Caution Sound'],
        filterSuggestions: ['Dark', 'Serious'],
        captionTemplate: '⚡ Cette erreur va DÉTRUIRE ton avenir !\n\nLe piège que 80% des jeunes tombent dedans !\n\n#mistake #future #warning #youth #advice'
      },
      {
        id: 18,
        title: '🌟 La technique pour ATTRIR L\'ARGENT comme un aimant !',
        description: 'Le secret de l\'abondance que les riches connaissent !',
        content: 'Les gens riches pensent différemment de l\'argent. Voici leur secret pour l\'attirer...',
        hashtags: ['#money', '#abundance', '#wealth', '#attraction', '#rich'],
        bestTime: '20:00',
        predictedEngagement: 0.48,
        viralPotential: 94,
        musicSuggestions: ['Abundance Beat', 'Money Mix'],
        filterSuggestions: ['Golden', 'Bright'],
        captionTemplate: '🌟 La technique pour ATTRIR L\'ARGENT comme un aimant !\n\nLe secret de l\'abondance que les riches connaissent !\n\n#money #abundance #wealth #attraction #rich'
      },
      {
        id: 19,
        title: '💀 Ce que les MÉDECINS ne veulent PAS que tu saches !',
        description: 'La vérité cachée sur la santé que personne ne partage !',
        content: 'Les médecins te cachent cette information. Voici ce qu\'ils ne veulent pas que tu découvres...',
        hashtags: ['#health', '#medical', '#truth', '#secret', '#wellness'],
        bestTime: '19:00',
        predictedEngagement: 0.57,
        viralPotential: 99,
        musicSuggestions: ['Medical Beat', 'Health Mix'],
        filterSuggestions: ['Clean', 'Professional'],
        captionTemplate: '💀 Ce que les MÉDECINS ne veulent PAS que tu saches !\n\nLa vérité cachée sur la santé que personne ne partage !\n\n#health #medical #truth #secret #wellness'
      },
      {
        id: 20,
        title: '🔥 Le secret pour CONTRÔLER ton destin !',
        description: 'La méthode pour prendre le contrôle de ta vie !',
        content: 'Tu penses que ton destin est écrit ? Détrompe-toi ! Voici comment reprendre le contrôle...',
        hashtags: ['#destiny', '#control', '#life', '#power', '#freedom'],
        bestTime: '21:00',
        predictedEngagement: 0.46,
        viralPotential: 92,
        musicSuggestions: ['Destiny Beat', 'Control Mix'],
        filterSuggestions: ['Bold', 'Dynamic'],
        captionTemplate: '🔥 Le secret pour CONTRÔLER ton destin !\n\nLa méthode pour prendre le contrôle de ta vie !\n\n#destiny #control #life #power #freedom'
      }
    ];

    // Sélectionner 2 exemples aléatoires
    const shuffled = examples.sort(() => 0.5 - Math.random());
    const selectedExamples = shuffled.slice(0, 2);

    return NextResponse.json({
      success: true,
      data: selectedExamples
    });

  } catch (error) {
    console.error('Erreur exemples de contenu:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la génération des exemples' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Méthode GET non supportée' 
  }, { status: 405 });
} 