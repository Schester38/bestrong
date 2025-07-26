import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    supabaseUrl: supabaseUrl ? 'Définie' : 'Manquante',
    supabaseKey: supabaseKey ? 'Définie' : 'Manquante',
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
} 