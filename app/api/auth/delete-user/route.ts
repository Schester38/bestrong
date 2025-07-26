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
  dateInscription?: string;
  dashboardAccess?: boolean;
  dashboardAccessExpiresAt?: string;
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

// Fonction pour sauvegarder les utilisateurs dans le fichier
function saveUsers(users: User[]): void {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(usersFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
  }
}

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

    // Charger les utilisateurs existants
    const users = loadUsers();

    let userIndex = -1;

    if (userId) {
      // Rechercher par ID (priorité)
      userIndex = users.findIndex(u => u.id === userId);
    } else {
      // Rechercher par téléphone (fallback)
      const fullPhone = `${country}${phone}`;
      userIndex = users.findIndex(u => u.phone === fullPhone);
    }

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'utilisateur
    const deletedUser = users.splice(userIndex, 1)[0];

    // Sauvegarder les modifications
    saveUsers(users);

    console.log(`Utilisateur supprimé: ${deletedUser.phone} (ID: ${deletedUser.id})`);

    return NextResponse.json({
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: deletedUser.id,
        phone: deletedUser.phone,
        credits: deletedUser.credits,
        pseudo: deletedUser.pseudo,
        createdAt: deletedUser.createdAt
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
    const users = loadUsers();
    const now = new Date();
    // Retourner les utilisateurs sans les mots de passe, avec dashboardAccess info
    const usersWithoutPasswords = users.map(user => {
      let dashboardAccessDaysLeft = null;
      let dashboardAccess = user.dashboardAccess;
      let dashboardAccessExpiresAt = user.dashboardAccessExpiresAt;
      if (user.dashboardAccess && user.dashboardAccessExpiresAt) {
        const expiresAt = new Date(user.dashboardAccessExpiresAt);
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        dateInscription: user.dateInscription,
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