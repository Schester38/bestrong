import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur avec nouvelle syntaxe
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('=== DÉBUT INSCRIPTION ===');
    console.log('Service key existe:', !!supabaseServiceKey);
    console.log('Service key commence par:', supabaseServiceKey?.substring(0, 10));
    
    const { phone, password, country, pseudo, parrain } = await request.json();
    console.log('Données reçues:', { phone, country, pseudo, parrain: parrain ? 'oui' : 'non' });

    // Validation des données
    if (!phone || !password || !country || !pseudo) {
      console.log('Erreur validation: champs manquants');
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    if (typeof pseudo !== 'string' || pseudo.trim().length < 2) {
      console.log('Erreur validation: pseudo trop court');
      return NextResponse.json(
        { error: 'Le pseudo est obligatoire (2 caractères minimum)' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      console.log('Erreur validation: mot de passe trop court');
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const fullPhone = `${country}${phone}`;
    console.log('Numéro complet:', fullPhone);

    // Créer le nouvel utilisateur directement
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
      date_inscription: new Date().toISOString(),
      dashboard_access: true
    };
    
    console.log('Données utilisateur à insérer:', { 
      ...userData, 
      password: '[HIDDEN]',
      id,
      phone: userData.phone,
      pseudo: userData.pseudo
    });
    
    console.log('Tentative d\'insertion via client Supabase...');
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      
      // Si c'est une erreur de doublon, on le gère spécifiquement
      if (error.code === '23505' && error.message.includes('phone')) {
        return NextResponse.json(
          { error: 'Ce numéro est déjà utilisé.' },
          { status: 409 }
        );
      }
      
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
    console.error('Erreur générale lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 