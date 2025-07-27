import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier de compteur
const countFilePath = path.join(process.cwd(), 'data', 'users_count.json');

// Compteur en mémoire pour éviter les problèmes de fichier
let userCountCache = 1785;
let lastCacheUpdate = 0;

// Fonction pour lire le compteur depuis le fichier
function readUserCountFromFile(): number {
  try {
    if (fs.existsSync(countFilePath)) {
      const countData = JSON.parse(fs.readFileSync(countFilePath, 'utf8'));
      return countData.count || 1785;
    }
  } catch (error) {
    console.error('Erreur lecture fichier compteur:', error);
  }
  return 1785;
}

// Fonction pour écrire le compteur dans le fichier
function writeUserCountToFile(count: number): void {
  try {
    const countData = {
      count: count,
      lastUpdated: new Date().toISOString()
    };
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(countFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(countFilePath, JSON.stringify(countData, null, 2));
    console.log('Compteur sauvegardé dans le fichier:', count);
  } catch (error) {
    console.error('Erreur écriture fichier compteur:', error);
  }
}

// Initialiser le cache au démarrage
userCountCache = readUserCountFromFile();

export async function GET() {
  try {
    console.log('API users/count appelée');
    
    // Vérifier si le cache est à jour (moins de 5 secondes)
    const now = Date.now();
    if (now - lastCacheUpdate > 5000) {
      userCountCache = readUserCountFromFile();
      lastCacheUpdate = now;
    }
    
    console.log('Nombre d\'utilisateurs retourné:', userCountCache);
    return NextResponse.json({ count: userCountCache });
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du nombre d'utilisateurs",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Fonction pour incrémenter le compteur (exportée pour être utilisée par d'autres APIs)
export function incrementUserCount(): number {
  userCountCache += 1;
  lastCacheUpdate = Date.now();
  writeUserCountToFile(userCountCache);
  console.log('Compteur incrémenté:', userCountCache);
  return userCountCache;
} 