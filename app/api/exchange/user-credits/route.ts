import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces
interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  created_at: string;
  updated_at: string;
}

// Route GET /api/exchange/user-credits?pseudo=xxx
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pseudo = url.searchParams.get("pseudo");
    if (!pseudo) return NextResponse.json({ error: "Pseudo manquant" }, { status: 400 });
    
    const { data: user, error } = await supabase
      .from('users')
      .select('credits, pseudo')
      .eq('pseudo', pseudo)
      .maybeSingle();

    if (error) {
      console.error('Erreur récupération utilisateur:', error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    
    return NextResponse.json({ credits: user ? user.credits : 0, pseudo: user ? user.pseudo : null });
  } catch (error) {
    console.error('Erreur GET /api/exchange/user-credits:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}