import { NextRequest, NextResponse } from "next/server";
import { beStrongAI } from "../../../utils/ai-features";

export async function POST(request: NextRequest) {
  try {
    const { userId, content, category } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      );
    }

    console.log("🤖 Analyse IA demandée pour:", { userId, content, category });

    // Obtenir l'analyse complète
    const analysis = await beStrongAI.getCompleteAnalysis(userId, content);

    console.log("✅ Analyse IA terminée:", analysis);

    return NextResponse.json({
      success: true,
      data: analysis,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur analyse IA:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse IA",
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

    console.log("🤖 Analyse IA GET pour:", userId);

    // Obtenir l'analyse complète
    const analysis = await beStrongAI.getCompleteAnalysis(userId);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur analyse IA GET:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse IA",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 