import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "API fonctionnelle",
      timestamp: new Date().toISOString(),
      status: "online",
      server: "BE STRONG API"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Erreur serveur",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 