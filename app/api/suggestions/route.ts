import { NextRequest, NextResponse } from 'next/server';
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

// POST: Ajout suggestion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, numeroOuId, suggestion } = body;
    if (!nom || !numeroOuId || !suggestion) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const newSuggestion = {
      id: Date.now().toString(),
      nom,
      numero_ou_id: numeroOuId,
      suggestion,
      date: new Date().toISOString()
    };

    const { error } = await supabase
      .from('suggestions')
      .insert(newSuggestion);

    if (error) {
      console.error('Erreur création suggestion:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de la suggestion.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Suggestion envoyée avec succès.' });
  } catch (e) {
    console.error('Erreur POST /api/suggestions:', e);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la suggestion.' }, { status: 500 });
  }
}

// GET: Liste suggestions (admin)
export async function GET() {
  try {
    const { data: suggestions, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur récupération suggestions:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des suggestions.' }, { status: 500 });
    }

    return NextResponse.json({ suggestions: suggestions || [] });
  } catch (e) {
    console.error('Erreur GET /api/suggestions:', e);
    return NextResponse.json({ error: 'Erreur lors de la récupération des suggestions.' }, { status: 500 });
  }
} 