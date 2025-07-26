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
  dashboardAccessExpiresAt?: string; // Date d'expiration accès admin
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

// PATCH /api/admin/users - Modifier l'accès au tableau de bord
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, dashboardAccess } = body;
    
    if (!userId || typeof dashboardAccess !== 'boolean') {
      return NextResponse.json({ 
        error: 'userId et dashboardAccess (boolean) requis' 
      }, { status: 400 });
    }

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Mettre à jour l'accès au tableau de bord
    users[userIndex].dashboardAccess = dashboardAccess;
    users[userIndex].updatedAt = new Date().toISOString();
    if (dashboardAccess) {
      // Accès donné : 30 jours à partir de maintenant
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours
      users[userIndex].dashboardAccessExpiresAt = expiresAt.toISOString();
    } else {
      // Accès retiré : supprimer la date d'expiration
      delete users[userIndex].dashboardAccessExpiresAt;
    }
    
    saveUsers(users);

    return NextResponse.json({ 
      success: true, 
      message: `Accès au tableau de bord ${dashboardAccess ? 'donné' : 'révoqué'} avec succès` 
    });

  } catch (e) {
    console.error('Erreur PATCH users:', e);
    return NextResponse.json({ 
      error: 'Erreur lors de la modification de l\'accès' 
    }, { status: 500 });
  }
}
