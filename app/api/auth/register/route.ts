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
  dateDernierPaiement: string | null; // ISO string ou null
  dateInscription?: string; // Ajouté pour la période d'essai
  dashboardAccess?: boolean; // Ajouté pour l'accès manuel/admin
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
    const { phone, password, country, pseudo, parrain } = await request.json();

    // Validation des données
    if (!phone || !password || !country || !pseudo) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    if (typeof pseudo !== 'string' || pseudo.trim().length < 2) {
      return NextResponse.json(
        { error: 'Le pseudo est obligatoire (2 caractères minimum)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const fullPhone = `${country}${phone}`;

    // Charger les utilisateurs existants
    const users = loadUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.phone === fullPhone);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce numéro est déjà utilisé.' },
        { status: 409 }
      );
    }

    // Créer le nouvel utilisateur avec dateDernierPaiement null
    const newUser: User = {
      id: Date.now().toString(),
      phone: fullPhone,
      password: await bcrypt.hash(password, 12),
      credits: 150,
      pseudo: pseudo.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateDernierPaiement: null,
      dateInscription: new Date().toISOString(), // Ajout de la date d'inscription
      dashboardAccess: true, // Accès initial accordé
      ...(parrain ? { parrain } : {}),
    };
    users.push(newUser);
    saveUsers(users);

    // Incrémenter le compteur personnalisé
    try {
      const userCountFilePath = path.join(process.cwd(), 'data', 'users_count.json');
      let count = 0;
      if (fs.existsSync(userCountFilePath)) {
        const data = fs.readFileSync(userCountFilePath, 'utf8');
        const json = JSON.parse(data);
        count = json.count || 0;
      }
      count += 1;
      fs.writeFileSync(userCountFilePath, JSON.stringify({ count }, null, 2));
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation du compteur personnalisé:', error);
    }

    // Retourner les données utilisateur (sans le mot de passe)
    // Enregistrer l'activité d'inscription
    try {
      await fetch(`${request.nextUrl.origin}/api/admin/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newUser.id,
          userPhone: newUser.phone,
          userPseudo: newUser.pseudo,
          type: 'register',
          description: 'Nouveau compte créé',
          credits: newUser.credits
        }),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }

    // Réponse spéciale pour indiquer au frontend d'incrémenter le compteur
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie',
      triggerUserCountIncrement: true,
      user: {
        id: newUser.id,
        phone: newUser.phone,
        pseudo: newUser.pseudo,
        credits: newUser.credits,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        dateInscription: newUser.dateInscription,
        dashboardAccess: newUser.dashboardAccess
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 