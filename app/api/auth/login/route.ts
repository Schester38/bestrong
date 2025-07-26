import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../utils/supabase';
import { logActivity } from '../../../utils/activities';

export async function POST(request: NextRequest) {
  try {
    const { phone, password, country } = await request.json();

    // Validation des données
    if (!phone || !password || !country) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const fullPhone = `${country}${phone}`;
    
    // Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', fullPhone)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier l'abonnement
    let abonnementValide = false;
    let dateDernierPaiement = null;
    if (user.date_dernier_paiement) {
      dateDernierPaiement = user.date_dernier_paiement;
      const dateFin = new Date(user.date_dernier_paiement);
      dateFin.setDate(dateFin.getDate() + 30);
      abonnementValide = new Date() < dateFin;
    }

    // Enregistrer l'activité de connexion
    await logActivity({
      userId: user.id,
      userPhone: user.phone,
      userPseudo: user.pseudo,
      type: 'login',
      description: 'Connexion réussie'
    });

    // Retourner les données utilisateur (sans le mot de passe)
    const userWithoutPassword = {
      id: user.id,
      phone: user.phone,
      credits: user.credits,
      pseudo: user.pseudo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      dateDernierPaiement: dateDernierPaiement
    };

    return NextResponse.json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      abonnementValide
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}