import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans challenges/[id]:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);

// PUT: Mettre à jour un défi
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeData = await request.json();
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Adapter aux colonnes existantes de la table activities
    const updateData = {
      description: challengeData.description || challengeData.title,
      details: JSON.stringify({
        type: challengeData.type,
        difficulty: challengeData.difficulty,
        category: challengeData.category,
        reward_credits: challengeData.reward_credits || 0,
        reward_experience: challengeData.reward_experience || 0,
        target_value: challengeData.target_value || 1,
        is_active: challengeData.is_active !== false
      }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .eq('type', 'task_created')
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour défi:', error);
      return NextResponse.json({ error: 'Erreur mise à jour défi' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      challenge: data,
      message: 'Défi mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur API admin challenges PUT:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE: Supprimer un défi
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('type', 'task_created');

    if (error) {
      console.error('Erreur suppression défi:', error);
      return NextResponse.json({ error: 'Erreur suppression défi' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Défi supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur API admin challenges DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 