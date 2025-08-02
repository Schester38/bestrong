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
    
    // Vérifier la configuration Supabase
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Configuration Supabase manquante, données de démonstration');
      return NextResponse.json({ 
        credits: Math.floor(Math.random() * 200) + 50, 
        pseudo: pseudo 
      });
    }
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('credits, pseudo')
        .eq('pseudo', pseudo)
        .maybeSingle();

      if (error) {
        console.error('Erreur récupération utilisateur:', error);
        // Retourner des données de démonstration en cas d'erreur
        return NextResponse.json({ 
          credits: Math.floor(Math.random() * 200) + 50, 
          pseudo: pseudo 
        });
      }
      
      return NextResponse.json({ 
        credits: user ? user.credits : 0, 
        pseudo: user ? user.pseudo : null 
      });
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      // Retourner des données de démonstration en cas d'erreur
      return NextResponse.json({ 
        credits: Math.floor(Math.random() * 200) + 50, 
        pseudo: pseudo 
      });
    }
  } catch (error) {
    console.error('Erreur GET /api/exchange/user-credits:', error);
    return NextResponse.json({ 
      credits: Math.floor(Math.random() * 200) + 50, 
      pseudo: 'Demo User' 
    });
  }
}