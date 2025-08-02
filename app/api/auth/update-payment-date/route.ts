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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    
    // Vérifier si l'utilisateur existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur vérification utilisateur:', checkError);
      return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
    }

    // Si l'utilisateur n'existe pas, le créer
    if (!existingUser) {
      console.log('🔧 Création de l\'utilisateur:', userId);
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          phone: '+237672886348',
          password: 'default_password_123', // Mot de passe par défaut
          credits: 150,
          date_inscription: new Date().toISOString(),
          date_dernier_paiement: new Date().toISOString()
        });

      if (createError) {
        console.error('Erreur création utilisateur:', createError);
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
      }
      
      console.log('✅ Utilisateur créé avec succès');
      return NextResponse.json({ success: true, userCreated: true });
    }

    // Mettre à jour la date de dernier paiement
    const { error } = await supabase
      .from('users')
      .update({ 
        date_dernier_paiement: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Erreur mise à jour date paiement:', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    console.log('✅ Date de paiement mise à jour');
    return NextResponse.json({ success: true, userCreated: false });
  } catch (error) {
    console.error('Erreur POST /api/auth/update-payment-date:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 