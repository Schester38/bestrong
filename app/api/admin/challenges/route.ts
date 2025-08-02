import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans challenges:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// GET: Récupérer tous les défis
export async function GET(request: NextRequest) {
  try {
    const { data: challenges, error } = await supabase
      .from('activities')
      .select('*')
      .eq('type', 'task_created')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération défis:', error);
      return NextResponse.json({ error: 'Erreur récupération défis' }, { status: 500 });
    }

    return NextResponse.json({ challenges: challenges || [] });
  } catch (error) {
    console.error('Erreur API admin challenges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Créer un nouveau défi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, difficulty, category, reward_credits, reward_experience, target_value, is_active } = body;

    // Récupérer un utilisateur existant pour les données requises
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, phone, pseudo')
      .limit(1);

    if (userError || !existingUser || existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun utilisateur trouvé pour créer le défi' 
      }, { status: 500 });
    }

    const adminUser = existingUser[0];

    const newChallenge = {
      id: Date.now().toString(),
      user_id: adminUser.id,
      user_phone: adminUser.phone,
      user_pseudo: adminUser.pseudo || 'Admin',
      type: 'task_created', // Utiliser le type autorisé
      description: description || title || 'Nouveau défi',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(newChallenge)
      .select()
      .single();

    if (error) {
      console.error('Erreur création défi:', error);
      return NextResponse.json({ 
        error: 'Erreur création défi: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Défi créé avec succès !',
      challenge: data 
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
}

// PUT: Mettre à jour un défi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, difficulty, category, reward_credits, reward_experience, target_value, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du défi requis' }, { status: 400 });
    }

    const updateData = {
      description: description || title || 'Défi mis à jour',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour défi:', error);
      return NextResponse.json({ 
        error: 'Erreur mise à jour défi: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Défi mis à jour avec succès !',
      challenge: data 
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
}

// DELETE: Supprimer un défi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du défi requis' }, { status: 400 });
    }

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression défi:', error);
      return NextResponse.json({ 
        error: 'Erreur suppression défi: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Défi supprimé avec succès !'
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
    }, { status: 500 });
  }
} 