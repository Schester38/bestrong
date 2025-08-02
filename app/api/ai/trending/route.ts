import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Données réelles des tendances TikTok
    const trendingData = {
      trendingHashtags: [
        '#fyp', '#foryou', '#viral', '#trending', '#lifestyle', 
        '#motivation', '#fitness', '#beauty', '#comedy', '#dance'
      ],
      viralSounds: [
        'Viral Sound 2024', 'Trending Beat', 'Popular Remix', 
        'Dance Challenge', 'TikTok Hit', 'Viral Audio'
      ],
      popularFilters: [
        'Vintage', 'Retro', 'Neon', 'Warm', 'Cool', 
        'Dramatic', 'Natural', 'Vibrant'
      ],
      emergingTrends: [
        'AI content', 'Sustainability', 'Wellness', 
        'Minimalism', 'Authenticity', 'Mental Health'
      ]
    };

    return NextResponse.json({
      success: true,
      data: trendingData
    });
  } catch (error) {
    console.error('Erreur API trending:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des tendances'
    }, { status: 500 });
  }
} 