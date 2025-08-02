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

    // Vérifier la période d'essai (45 jours après inscription)
    let periodeEssaiValide = false;
    if (user.date_inscription) {
      const dateInscription = new Date(user.date_inscription);
      const dateFinEssai = new Date(dateInscription);
      dateFinEssai.setDate(dateFinEssai.getDate() + 45);
      periodeEssaiValide = new Date() < dateFinEssai;
    }

    // Vérifier l'accès admin
    let hasAdminAccess = false;
    if (user.dashboard_access) {
      if (user.dashboard_access_expires_at) {
        const now = new Date();
        const expiresAt = new Date(user.dashboard_access_expires_at);
        hasAdminAccess = now < expiresAt;
      } else {
        hasAdminAccess = true;
      }
    }

    // L'utilisateur a accès s'il a un abonnement valide, une période d'essai valide, ou un accès admin
    const hasAccess = abonnementValide || periodeEssaiValide || hasAdminAccess;

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
      dateDernierPaiement: dateDernierPaiement,
      dateInscription: user.date_inscription,
      dashboardAccess: hasAdminAccess,
      dashboardAccessExpiresAt: user.dashboard_access_expires_at
    };

    return NextResponse.json({
      message: 'Connexion réussie',
      user: userWithoutPassword,
      abonnementValide,
      periodeEssaiValide,
      hasAdminAccess,
      hasAccess
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}