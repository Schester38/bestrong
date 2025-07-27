import { NextRequest, NextResponse } from "next/server";
import { beStrongAI } from "../../../utils/ai-features";

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      );
    }

    console.log("🎯 Suggestions contenu IA pour:", { userId, preferences });

    // Obtenir les suggestions personnalisées
    const suggestions = await beStrongAI.getPersonalizedRecommendations(userId);

    console.log("✅ Suggestions générées:", suggestions.length);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur suggestions contenu:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      );
    }

    console.log("🎯 Suggestions contenu IA GET pour:", userId);

    // Obtenir les suggestions personnalisées
    const suggestions = await beStrongAI.getPersonalizedRecommendations(userId);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur suggestions contenu GET:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 