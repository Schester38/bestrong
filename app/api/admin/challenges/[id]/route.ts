import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    const updateData = {
      title: challengeData.title,
      description: challengeData.description,
      challenge_type: challengeData.type,
      difficulty: challengeData.difficulty,
      category: challengeData.category,
      reward_credits: challengeData.reward_credits || 0,
      reward_experience: challengeData.reward_experience || 0,
      target_value: challengeData.target_value || 1,
      is_active: challengeData.is_active !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id)
      .eq('type', 'challenge')
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
      .eq('type', 'challenge');

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