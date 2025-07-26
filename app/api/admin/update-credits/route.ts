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
  links?: { label: string; url: string }[];
}

// Chemin vers le fichier de stockage des utilisateurs
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
    const { userId, credits } = await request.json();

    // Validation des données
    if (!userId || credits === undefined || credits < 0) {
      return NextResponse.json(
        { error: 'ID utilisateur et crédits valides requis' },
        { status: 400 }
      );
    }

    // Charger les utilisateurs existants
    const users = loadUsers();

    // Trouver l'utilisateur
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const oldCredits = users[userIndex].credits;
    const creditsDifference = credits - oldCredits;

    // Mettre à jour les crédits
    users[userIndex].credits = credits;
    users[userIndex].updatedAt = new Date().toISOString();

    // Sauvegarder les modifications
    saveUsers(users);
      // --- Notification top 50 ---
try {
  // Charger tous les utilisateurs triés par crédits décroissants
  const sorted = [...users].sort((a, b) => b.credits - a.credits);
  // Récupérer les 50 premiers
  const top50 = sorted.slice(0, 50);
  // Vérifier si l'utilisateur modifié est dans le top 50
  const isInTop50 = top50.some(u => u.id === userId);
  // Vérifier s'il n'a pas de liens personnalisés ou liens vides
  const user = users[userIndex];
  const hasNoLinks = !user.links || user.links.length === 0 || user.links.every((l: { label?: string; url?: string }) => !l.label && !l.url);
  if (isInTop50 && hasNoLinks) {
    // Import dynamique pour éviter problème d'import côté API
    const { addNotification } = await import('../../../utils/notifications');
    addNotification(userId, 'invite-links', "Complète tes liens personnalisés pour profiter de plus de visibilité dans le classement !");
  }
} catch (err) {
  console.error('Erreur notification top 50:', err);
}
// --- Fin notification top 50 ---
    // Enregistrer l'activité
    try {
      await fetch(`${request.nextUrl.origin}/api/admin/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: users[userIndex].id,
          userPhone: users[userIndex].phone,
          userPseudo: users[userIndex].pseudo,
          type: creditsDifference > 0 ? 'credits_earned' : 'credits_spent',
          description: creditsDifference > 0 
            ? `Crédits ajoutés par l'administrateur (+${creditsDifference})`
            : `Crédits retirés par l'administrateur (${creditsDifference})`,
          credits: Math.abs(creditsDifference),
          details: {
            oldCredits,
            newCredits: credits,
            difference: creditsDifference,
            action: 'admin_update'
          }
        }),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }

    // Mettre à jour les données utilisateur dans le localStorage si l'utilisateur est connecté
    // Cette mise à jour sera récupérée par le dashboard lors du prochain rafraîchissement

    return NextResponse.json({
      message: 'Crédits mis à jour avec succès',
      user: {
        id: users[userIndex].id,
        phone: users[userIndex].phone,
        credits: users[userIndex].credits,
        pseudo: users[userIndex].pseudo,
        createdAt: users[userIndex].createdAt,
        updatedAt: users[userIndex].updatedAt
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des crédits:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 