import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier du compteur personnalisé
const userCountFilePath = path.join(process.cwd(), 'data', 'users_count.json');

// Fonction utilitaire pour charger le compteur
function loadUserCount(): number {
  try {
    if (fs.existsSync(userCountFilePath)) {
      const data = fs.readFileSync(userCountFilePath, 'utf8');
      const json = JSON.parse(data);
      return json.count || 0;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du compteur personnalisé:', error);
  }
  return 0;
}

export async function GET() {
  try {
    const count = loadUserCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ error: "Erreur lors du chargement du nombre d'utilisateurs" }, { status: 500 });
  }
} 