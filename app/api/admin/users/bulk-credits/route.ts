import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


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

interface User {
  id: string;
  phone: string;
  credits: number;
  pseudo: string | null;
  created_at: string;
  updated_at: string;
  dashboard_access?: boolean;
  date_dernier_paiement?: string;
}

// POST /api/admin/users/bulk-credits - Ajouter des crédits à tous les utilisateurs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creditsToAdd } = body;
    
    if (!creditsToAdd || typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
      return NextResponse.json({ 
        error: 'creditsToAdd (nombre positif) requis' 
      }, { status: 400 });
    }

    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('Erreur récupération utilisateurs:', fetchError);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des utilisateurs' 
      }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun utilisateur trouvé' 
      }, { status: 404 });
    }

    // Mettre à jour tous les utilisateurs avec les nouveaux crédits
    for (const user of users) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          credits: user.credits + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Erreur mise à jour utilisateur:', updateError);
        return NextResponse.json({ 
          error: 'Erreur lors de l\'ajout des crédits' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${creditsToAdd} crédits ajoutés à ${users.length} utilisateurs`,
      usersUpdated: users.length
    });

  } catch (e) {
    console.error('Erreur POST bulk-credits:', e);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'ajout des crédits' 
    }, { status: 500 });
  }
} 