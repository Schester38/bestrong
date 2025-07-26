import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

interface User {
  id: string;
  phone: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
  dashboardAccess?: boolean;
  dateDernierPaiement?: string;
}

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function loadUsers(): User[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erreur chargement utilisateurs:', e);
  }
  return [];
}

function saveUsers(users: User[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Erreur sauvegarde utilisateurs:', e);
  }
}

// POST /api/admin/users/bulk-credits - Ajouter des crédits à tous les utilisateurs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { creditsToAdd } = body;
    
    if (!creditsToAdd || typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
      return NextResponse.json({ 
        error: 'creditsToAdd (nombre positif) requis' 
      }, { status: 400 });
    }

    const users = loadUsers();
    
    if (users.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun utilisateur trouvé' 
      }, { status: 404 });
    }

    // Ajouter les crédits à tous les utilisateurs
    const updatedUsers = users.map(user => ({
      ...user,
      credits: user.credits + creditsToAdd,
      updatedAt: new Date().toISOString()
    }));
    
    saveUsers(updatedUsers);

    return NextResponse.json({ 
      success: true, 
      message: `${creditsToAdd} crédits ajoutés à ${updatedUsers.length} utilisateurs`,
      usersUpdated: updatedUsers.length
    });

  } catch (e) {
    console.error('Erreur POST bulk-credits:', e);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'ajout des crédits' 
    }, { status: 500 });
  }
} 