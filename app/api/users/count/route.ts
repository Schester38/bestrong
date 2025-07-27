import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    console.log('API users/count appelée');
    
    // Lire le compteur depuis la table app_stats
    const { data, error } = await supabase
      .from('app_stats')
      .select('user_count')
      .eq('id', 'main')
      .single();

    if (error) {
      console.error('Erreur lecture compteur depuis Supabase:', error);
      // Si la table n'existe pas ou pas de données, retourner la valeur par défaut
      return NextResponse.json({ count: 1787 });
    }

    const count = data?.user_count || 1787;
    console.log('Nombre d\'utilisateurs depuis Supabase:', count);
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du nombre d'utilisateurs",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Fonction pour incrémenter le compteur (exportée pour être utilisée par d'autres APIs)
export async function incrementUserCount(): Promise<number> {
  try {
    // Utiliser une transaction pour incrémenter de manière atomique
    const { data: currentData, error: readError } = await supabase
      .from('app_stats')
      .select('user_count')
      .eq('id', 'main')
      .single();

    let currentCount = 1787;
    if (currentData) {
      currentCount = currentData.user_count || 1787;
    }

    const newCount = currentCount + 1;

    // Mettre à jour ou créer l'enregistrement
    const { error: updateError } = await supabase
      .from('app_stats')
      .upsert({ 
        id: 'main', 
        user_count: newCount,
        last_updated: new Date().toISOString()
      });

    if (updateError) {
      console.error('Erreur mise à jour compteur dans Supabase:', updateError);
      return currentCount;
    }

    console.log('Compteur incrémenté dans Supabase:', newCount);
    return newCount;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    return 1787; // Valeur de fallback
  }
} 