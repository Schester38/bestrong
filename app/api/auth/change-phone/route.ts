import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, oldPhone, newPhone } = await request.json();

    if (!userId || !oldPhone || !newPhone) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs sont requis'
      }, { status: 400 });
    }

    // Validation du format du numéro
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(newPhone)) {
      return NextResponse.json({
        success: false,
        error: 'Format de numéro invalide. Utilisez le format: +237655441122'
      }, { status: 400 });
    }

    // Vérifier que le nouveau numéro n'est pas déjà utilisé
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', newPhone)
      .neq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur vérification numéro:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la vérification du numéro'
      }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur'
      }, { status: 400 });
    }

    // Mettre à jour le numéro de téléphone
    const { error: updateError } = await supabase
      .from('users')
      .update({ phone: newPhone })
      .eq('id', userId)
      .eq('phone', oldPhone);

    if (updateError) {
      console.error('Erreur mise à jour téléphone:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la mise à jour du numéro de téléphone'
      }, { status: 500 });
    }

    // Mettre à jour les messages associés (optionnel)
    try {
      await supabase
        .from('messages')
        .update({ from_user: newPhone })
        .eq('from_user', oldPhone);

      await supabase
        .from('messages')
        .update({ to_user: newPhone })
        .eq('to_user', oldPhone);
    } catch (messageError) {
      console.warn('Erreur mise à jour messages:', messageError);
      // On continue même si la mise à jour des messages échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Numéro de téléphone mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur changement téléphone:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
} 