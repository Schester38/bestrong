import { NextRequest, NextResponse } from 'next/server';
import { MusicAI } from '../../../utils/ai-features';

const musicAI = new MusicAI();

export async function POST(request: NextRequest) {
  try {
    const { content, mood } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🎵 Génération suggestions musicales IA pour:", { content, mood });

    // Générer les suggestions musicales
    const suggestions = await musicAI.suggestMusic(content, mood);

    console.log("✅ Suggestions musicales générées:", suggestions);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération suggestions musicales:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions musicales",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
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