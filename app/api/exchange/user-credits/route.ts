import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Interfaces
interface User {
  id: string;
  phone: string;
  password: string;
  credits: number;
  pseudo: string | null;
  createdAt: string;
  updatedAt: string;
}

// Chemins vers les fichiers de stockage
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Fonctions utilitaires
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

// Route GET /api/exchange/user-credits?pseudo=xxx
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pseudo = url.searchParams.get("pseudo");
    if (!pseudo) return NextResponse.json({ error: "Pseudo manquant" }, { status: 400 });
    
    const users = loadUsers();
    const user = users.find(u => u.pseudo === pseudo);
    
    return NextResponse.json({ credits: user ? user.credits : 0, pseudo: user ? user.pseudo : null });
  } catch (error) {
    console.error('Erreur GET /api/exchange/user-credits:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}