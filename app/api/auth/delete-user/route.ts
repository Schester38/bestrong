import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase côté serveur
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(request: NextRequest) {
  try {
    const { phone, country, userId } = await request.json();

    // Validation des données
    if (!userId && (!phone || !country)) {
      return NextResponse.json(
        { error: 'ID utilisateur ou numéro de téléphone et pays requis' },
        { status: 400 }
      );
    }

    let userToDelete = null;

    if (userId) {
      // Rechercher par ID (priorité)
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Aucun compte trouvé' },
          { status: 404 }
        );
      }
      userToDelete = user;
    } else {
      // Rechercher par téléphone (fallback)
      const fullPhone = `${country}${phone}`;
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', fullPhone)
        .single();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Aucun compte trouvé' },
          { status: 404 }
        );
      }
      userToDelete = user;
    }

    // Supprimer l'utilisateur
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userToDelete.id);

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    console.log(`Utilisateur supprimé: ${userToDelete.phone} (ID: ${userToDelete.id})`);

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: userToDelete.id,
        phone: userToDelete.phone,
        credits: userToDelete.credits,
        pseudo: userToDelete.pseudo,
        createdAt: userToDelete.created_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// API pour lister tous les utilisateurs (pour l'interface d'administration)
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      return NextResponse.json(
        { error: 'Erreur lors du chargement des utilisateurs' },
        { status: 500 }
      );
    }

    const now = new Date();
    
    // Retourner les utilisateurs sans les mots de passe, avec dashboardAccess info
    const usersWithoutPasswords = users.map(user => {
      let dashboardAccessDaysLeft = null;
      let dashboardAccess = user.dashboard_access;
      let dashboardAccessExpiresAt = user.dashboard_access_expires_at;
      
      if (user.dashboard_access && user.dashboard_access_expires_at) {
        const expiresAt = new Date(user.dashboard_access_expires_at);
        const diffMs = expiresAt.getTime() - now.getTime();
        dashboardAccessDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        if (diffMs < 0) {
          dashboardAccess = false;
          dashboardAccessDaysLeft = 0;
        }
      }
      
      return {
        id: user.id,
        phone: user.phone,
        credits: user.credits,
        pseudo: user.pseudo,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        dateInscription: user.date_inscription,
        dashboardAccess,
        dashboardAccessExpiresAt,
        dashboardAccessDaysLeft
      };
    });

    return NextResponse.json({
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length
    });
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 