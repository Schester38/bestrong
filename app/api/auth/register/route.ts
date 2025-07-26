import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('=== DÉBUT INSCRIPTION ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key existe:', !!supabaseAnonKey);
    
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

    // Vérifier si l'utilisateur existe déjà
    console.log('Vérification utilisateur existant...');
    const checkUrl = `${supabaseUrl}/rest/v1/users?phone=eq.${fullPhone}&select=id`;
    console.log('URL de vérification:', checkUrl);
    
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Réponse vérification:', checkResponse.status, checkResponse.statusText);

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.error('Erreur lors de la vérification:', checkResponse.status, checkResponse.statusText, errorText);
      return NextResponse.json(
        { error: `Erreur lors de la vérification utilisateur: ${checkResponse.status}` },
        { status: 500 }
      );
    }

    const existingUsers = await checkResponse.json();
    console.log('Utilisateurs existants trouvés:', existingUsers.length);
    
    if (existingUsers.length > 0) {
      console.log('Utilisateur déjà existant');
      return NextResponse.json(
        { error: 'Ce numéro est déjà utilisé.' },
        { status: 409 }
      );
    }

    console.log('Utilisateur non trouvé, création...');

    // Créer le nouvel utilisateur avec données simplifiées
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
    
    console.log('Tentative d\'insertion via API REST...');
    const insertUrl = `${supabaseUrl}/rest/v1/users`;
    console.log('URL d\'insertion:', insertUrl);
    
    const insertResponse = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(userData)
    });

    console.log('Réponse insertion:', insertResponse.status, insertResponse.statusText);

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Erreur insertion API REST:', insertResponse.status, insertResponse.statusText, errorText);
      return NextResponse.json(
        { error: `Erreur lors de la création du compte: ${insertResponse.status} ${insertResponse.statusText}` },
        { status: 500 }
      );
    }

    const data = await insertResponse.json();
    console.log('Données retournées:', data);
    
    if (!data || !data[0]) {
      console.error('Aucune donnée retournée après insertion');
      return NextResponse.json(
        { error: 'Erreur: aucune donnée retournée après création' },
        { status: 500 }
      );
    }
    
    const createdUser = data[0];
    console.log('Utilisateur créé avec succès:', createdUser.id);

    // Retourner les données utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: createdUser.id,
        phone: createdUser.phone,
        pseudo: createdUser.pseudo,
        credits: createdUser.credits,
        createdAt: createdUser.created_at,
        updatedAt: createdUser.updated_at,
        dateInscription: createdUser.date_inscription,
        dashboardAccess: createdUser.dashboard_access
      }
    });
  } catch (error) {
    console.error('Erreur générale lors de l\'inscription:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 