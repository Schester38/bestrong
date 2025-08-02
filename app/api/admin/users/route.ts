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
  dashboard_access_expires_at?: string; // Date d'expiration accès admin
}

// PATCH /api/admin/users - Modifier l'accès au tableau de bord
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, dashboardAccess } = body;
    
    if (!userId || typeof dashboardAccess !== 'boolean') {
      return NextResponse.json({ 
        error: 'userId et dashboardAccess (boolean) requis' 
      }, { status: 400 });
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      dashboard_access: dashboardAccess,
      updated_at: new Date().toISOString()
    };

    if (dashboardAccess) {
      // Accès donné : 30 jours à partir de maintenant
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      updateData.dashboard_access_expires_at = expiresAt.toISOString();
    } else {
      // Accès retiré : supprimer la date d'expiration
      updateData.dashboard_access_expires_at = null;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la modification de l\'accès' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Accès au tableau de bord ${dashboardAccess ? 'donné' : 'révoqué'} avec succès` 
    });

  } catch (e) {
    console.error('Erreur PATCH users:', e);
    return NextResponse.json({ 
      error: 'Erreur lors de la modification de l\'accès' 
    }, { status: 500 });
  }
}
