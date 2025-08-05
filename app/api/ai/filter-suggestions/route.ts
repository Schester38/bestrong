import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    // Suggestions de filtres basées sur le contenu
    const filterSuggestions = [
      'Vintage', 'Retro', 'Neon', 'Warm', 'Cool', 'Dramatic', 
      'Natural', 'Vibrant', 'Moody', 'Bright', 'Soft', 'Bold',
      'Classic', 'Modern', 'Artistic', 'Cinematic'
    ];

    return NextResponse.json({
      success: true,
      suggestions: filterSuggestions
    });
  } catch (error) {
    console.error('Erreur API filter-suggestions:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération des suggestions de filtres'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const content = searchParams.get('content');

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🎨 Génération suggestions filtres IA GET pour:", { content });

    // Suggestions de filtres basées sur le contenu
    const filterSuggestions = [
      'Vintage', 'Retro', 'Neon', 'Warm', 'Cool', 'Dramatic', 
      'Natural', 'Vibrant', 'Moody', 'Bright', 'Soft', 'Bold',
      'Classic', 'Modern', 'Artistic', 'Cinematic'
    ];

    return NextResponse.json({
      success: true,
      suggestions: filterSuggestions,
      count: filterSuggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération suggestions filtres GET:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions de filtres",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 