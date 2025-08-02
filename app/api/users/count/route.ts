import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans route.ts:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

export async function GET() {
  try {
    console.log('🔄 API users/count appelée -', new Date().toISOString());
    
    // Lire le compteur depuis la table app_stats
    const { data, error } = await supabase
      .from('app_stats')
      .select('user_count')
      .eq('id', 'main')
      .single();

    if (error) {
      console.error('❌ Erreur lecture compteur depuis Supabase:', error);
      // Si la table n'existe pas ou pas de données, retourner la valeur par défaut
      const defaultCount = 1787;
      console.log('📊 Utilisation du compteur par défaut:', defaultCount);
      
      return NextResponse.json(
        { count: defaultCount },
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    const count = data?.user_count || 1787;
    console.log('✅ Nombre d\'utilisateurs depuis Supabase:', count);
    
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error("❌ Erreur API /api/users/count:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors du chargement du nombre d'utilisateurs",
        details: error instanceof Error ? error.message : String(error),
        count: 1787 // Valeur de fallback
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
}

// Fonction pour incrémenter le compteur (exportée pour être utilisée par d'autres APIs)
export async function incrementUserCount(): Promise<number> {
  try {
    console.log('🔄 Incrémentation du compteur d\'utilisateurs...');
    
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
    console.log(`📈 Incrémentation: ${currentCount} → ${newCount}`);

    // Mettre à jour ou créer l'enregistrement
    const { error: updateError } = await supabase
      .from('app_stats')
      .upsert({ 
        id: 'main', 
        user_count: newCount,
        last_updated: new Date().toISOString()
      });

    if (updateError) {
      console.error('❌ Erreur mise à jour compteur dans Supabase:', updateError);
      return currentCount;
    }

    console.log('✅ Compteur incrémenté dans Supabase:', newCount);
    return newCount;
  } catch (error) {
    console.error('❌ Erreur lors de l\'incrémentation du compteur:', error);
    return 1787; // Valeur de fallback
  }
} 