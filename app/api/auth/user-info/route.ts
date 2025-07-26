import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json(
        { error: 'ID utilisateur ou numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur depuis Supabase
    let query = supabase.from('users').select('*');
    
    if (userId) {
      query = query.eq('id', userId);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data: user, error } = await query.maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Bloquer l'accès admin si la date d'expiration est dépassée
    let dashboardAccessDaysLeft = null;
    let dashboardAccess = user.dashboard_access;
    if (user.dashboard_access && user.dashboard_access_expires_at) {
      const now = new Date();
      const expiresAt = new Date(user.dashboard_access_expires_at);
      const diffMs = expiresAt.getTime() - now.getTime();
      dashboardAccessDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      if (diffMs < 0) {
        dashboardAccess = false;
        dashboardAccessDaysLeft = 0;
      }
    }

    // Retourner les données utilisateur (sans le mot de passe)
    const userWithoutPassword = {
      id: user.id,
      phone: user.phone,
      credits: user.credits,
      pseudo: user.pseudo,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      dashboardAccess: dashboardAccess,
      dateDernierPaiement: user.date_dernier_paiement,
      dateInscription: user.date_inscription,
      dashboardAccessExpiresAt: user.dashboard_access_expires_at
    };

    return NextResponse.json({
      user: userWithoutPassword,
      dashboardAccessDaysLeft
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 