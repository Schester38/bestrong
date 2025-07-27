import { NextRequest, NextResponse } from 'next/server';
import { FilterAI } from '../../../utils/ai-features';

const filterAI = new FilterAI();

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🎨 Génération suggestions filtres IA pour:", { content });

    // Générer les suggestions de filtres
    const suggestions = await filterAI.suggestFilters(content);

    console.log("✅ Suggestions de filtres générées:", suggestions);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération suggestions filtres:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des suggestions de filtres",
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

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🎨 Génération suggestions filtres IA GET pour:", { content });

    // Générer les suggestions de filtres
    const suggestions = await filterAI.suggestFilters(content);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
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