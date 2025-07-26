import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Simulation de la base de données pour l'instant
// En production, utilisez Prisma avec le schéma mis à jour
interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
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

export async function POST(request: NextRequest) {
  try {
    const { phone, newPassword, country } = await request.json();

    // Validation des données
    if (!phone || !newPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const fullPhone = `${country}${phone}`;

    // Charger les utilisateurs existants
    const users = loadUsers();

    // Trouver l'utilisateur
    const userIndex = users.findIndex(u => u.phone === fullPhone);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec ce numéro de téléphone' },
        { status: 404 }
      );
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    users[userIndex].password = hashedPassword;
    users[userIndex].updatedAt = new Date().toISOString();

    // Sauvegarder les modifications
    saveUsers(users);

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 