import { NextRequest, NextResponse } from "next/server";
import { HashtagAI } from "../../../utils/ai-features";

const hashtagAI = new HashtagAI();

export async function POST(request: NextRequest) {
  try {
    const { content, category } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🏷️ Génération hashtags IA pour:", { content, category });

    // Générer les hashtags
    const hashtags = await hashtagAI.generateHashtags(content, category);

    console.log("✅ Hashtags générés:", hashtags);

    return NextResponse.json({
      success: true,
      data: hashtags,
      hashtags: hashtags,
      count: hashtags.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération hashtags:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des hashtags",
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
    const category = searchParams.get('category');

    if (!content) {
      return NextResponse.json(
        { error: "content est requis" },
        { status: 400 }
      );
    }

    console.log("🏷️ Génération hashtags IA GET pour:", { content, category });

    // Générer les hashtags
    const hashtags = await hashtagAI.generateHashtags(content, category || undefined);

    return NextResponse.json({
      success: true,
      hashtags,
      count: hashtags.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erreur génération hashtags GET:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération des hashtags",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 