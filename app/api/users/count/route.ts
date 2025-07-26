import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Variables d\'environnement:');
console.log('URL:', supabaseUrl);
console.log('Anon Key existe:', !!supabaseAnonKey);
console.log('Service Key existe:', !!supabaseServiceKey);
console.log('Service Key longueur:', supabaseServiceKey?.length || 0);

// Client Supabase côté serveur - utiliser la clé anon pour l'instant
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    console.log('API users/count appelée');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service key existe:', !!supabaseServiceKey);
    
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erreur comptage utilisateurs:', error);
      return NextResponse.json({ 
        error: "Erreur lors du chargement du nombre d'utilisateurs",
        details: error.message 
      }, { status: 500 });
    }

    console.log('Nombre d\'utilisateurs:', count);
    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du nombre d'utilisateurs",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 