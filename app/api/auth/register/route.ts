import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone, password, country, pseudo, parrain } = await request.json();

    // Validation des données
    if (!phone || !password || !country || !pseudo) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    if (typeof pseudo !== 'string' || pseudo.trim().length < 2) {
      return NextResponse.json(
        { error: 'Le pseudo est obligatoire (2 caractères minimum)' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const fullPhone = `${country}${phone}`;
    console.log('Tentative d\'inscription pour:', fullPhone);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', fullPhone)
      .maybeSingle();
    
    if (findError) {
      console.error('Erreur lors de la vérification utilisateur existant:', findError);
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce numéro est déjà utilisé.' },
        { status: 409 }
      );
    }

    // Créer le nouvel utilisateur
    const id = Date.now().toString();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      id,
      phone: fullPhone,
      password: hashedPassword,
      credits: 150,
      pseudo: pseudo.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      date_dernier_paiement: null,
      date_inscription: new Date().toISOString(),
      dashboard_access: true,
      ...(parrain ? { parrain } : {}),
    };
    
    console.log('Données utilisateur à insérer:', { ...userData, password: '[HIDDEN]' });
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase détaillée:', error);
      return NextResponse.json(
        { error: `Erreur lors de la création du compte: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Utilisateur créé avec succès:', data.id);

    // Retourner les données utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: data.id,
        phone: data.phone,
        pseudo: data.pseudo,
        credits: data.credits,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        dateInscription: data.date_inscription,
        dashboardAccess: data.dashboard_access
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 