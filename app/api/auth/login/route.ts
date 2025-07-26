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
  dateDernierPaiement?: string; // Ajout de la date de dernier paiement
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
    const users = loadUsers();
    const user = users.find(u => u.phone === fullPhone);
    if (!user) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Numéro de téléphone ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    // Retourner les données utilisateur (sans le mot de passe)
    // Ajout vérification abonnement
    let abonnementValide = false;
    let dateDernierPaiement = null;
    if ('dateDernierPaiement' in user && user.dateDernierPaiement) {
      dateDernierPaiement = user.dateDernierPaiement;
      const dateFin = new Date(user.dateDernierPaiement);
      dateFin.setDate(dateFin.getDate() + 30);
      abonnementValide = new Date() < dateFin;
    }
    const userWithoutPassword = {
      id: user.id,
      phone: user.phone,
      credits: user.credits,
      pseudo: user.pseudo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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