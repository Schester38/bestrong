import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erreur comptage utilisateurs:', error);
      return NextResponse.json({ error: "Erreur lors du chargement du nombre d'utilisateurs" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ error: "Erreur lors du chargement du nombre d'utilisateurs" }, { status: 500 });
  }
} 