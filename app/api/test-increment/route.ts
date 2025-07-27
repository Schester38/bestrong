import { NextResponse } from "next/server";
import { incrementUserCount } from "../users/count/route";

export async function GET() {
  try {
    const { incrementUserCount } = await import('../users/count/route');
    const newCount = await incrementUserCount();
    return NextResponse.json({ 
      success: true, 
      message: 'Compteur incrémenté avec succès',
      newCount: newCount 
    });
  } catch (error) {
    console.error("Erreur lors de l'incrémentation de test:", error);
    return NextResponse.json({ 
      error: "Erreur lors de l'incrémentation",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 