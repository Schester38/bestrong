import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log('=== DÉBUT INSCRIPTION ===');
    
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
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?phone=eq.${fullPhone}&select=id`, {
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      }
    });

    if (!checkResponse.ok) {
      console.error('Erreur lors de la vérification:', checkResponse.status, checkResponse.statusText);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification utilisateur' },
        { status: 500 }
      );
    }

    const existingUsers = await checkResponse.json();
    if (existingUsers.length > 0) {
      console.log('Utilisateur déjà existant');
      return NextResponse.json(
        { error: 'Ce numéro est déjà utilisé.' },
        { status: 409 }
      );
    }

    console.log('Utilisateur non trouvé, création...');

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
    
    console.log('Données utilisateur à insérer:', { 
      ...userData, 
      password: '[HIDDEN]',
      id,
      phone: userData.phone,
      pseudo: userData.pseudo
    });
    
    console.log('Tentative d\'insertion via API REST...');
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(userData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Erreur insertion API REST:', insertResponse.status, insertResponse.statusText, errorText);
      return NextResponse.json(
        { error: `Erreur lors de la création du compte: ${insertResponse.status} ${insertResponse.statusText}` },
        { status: 500 }
      );
    }

    const data = await insertResponse.json();
    console.log('Utilisateur créé avec succès:', data[0]?.id);

    // Retourner les données utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: data[0].id,
        phone: data[0].phone,
        pseudo: data[0].pseudo,
        credits: data[0].credits,
        createdAt: data[0].created_at,
        updatedAt: data[0].updated_at,
        dateInscription: data[0].date_inscription,
        dashboardAccess: data[0].dashboard_access
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