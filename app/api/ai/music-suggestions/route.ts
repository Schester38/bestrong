import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mood } = body;

    // Suggestions musicales basées sur le contenu et l'humeur
    const musicSuggestions = [
      'TikTok Viral Song 2024', 'Trending Beat', 'Popular Remix', 
      'Dance Challenge Music', 'Motivation Mix', 'Workout Beat', 
      'Chill Vibes', 'Energy Boost', 'Focus Music', 'Party Anthem', 
      'Relaxing Tunes', 'Upbeat Rhythm', 'Viral Sound', 'Trending Audio'
    ];

    return NextResponse.json({
      success: true,
      suggestions: musicSuggestions
    });
  } catch (error) {
    console.error('Erreur API music-suggestions:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération des suggestions musicales'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const content = searchParams.get('content');
    const mood = searchParams.get('mood');

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🎵 Génération suggestions musicales IA GET pour:", { content, mood });

    // Générer les suggestions musicales
    const suggestions = await musicAI.suggestMusic(content, mood || 'energetic');

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération suggestions musicales GET:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions musicales",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 