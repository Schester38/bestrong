import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardAccess?: boolean;
  dateDernierPaiement?: string;
  dateInscription?: string; // Ajout pour la période d'essai
  dashboardAccessExpiresAt?: string; // Ajout pour la date d'expiration de l'accès admin
}

// Chemin vers le fichier de stockage
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Fonction pour charger les utilisateurs depuis le fichier
function loadUsers(): User[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
  }
  return [];
}

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

    // Charger les utilisateurs existants
    const users = loadUsers();

    // Trouver l'utilisateur
    let user: User | undefined;
    if (userId) {
      user = users.find(u => u.id === userId);
    } else if (phone) {
      user = users.find(u => u.phone === phone);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Bloquer l'accès admin si la date d'expiration est dépassée
    let dashboardAccessDaysLeft = null;
    let dashboardAccess = user.dashboardAccess;
    if (user.dashboardAccess && user.dashboardAccessExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(user.dashboardAccessExpiresAt);
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      dashboardAccess: dashboardAccess,
      dateDernierPaiement: user.dateDernierPaiement,
      dateInscription: user.dateInscription, // Ajout pour la période d'essai
      dashboardAccessExpiresAt: user.dashboardAccessExpiresAt
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