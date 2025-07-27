import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier de compteur
const countFilePath = path.join(process.cwd(), 'data', 'users_count.json');

export async function GET() {
  try {
    console.log('API users/count appelée');
    
    // Lire le fichier de compteur
    if (fs.existsSync(countFilePath)) {
      const countData = JSON.parse(fs.readFileSync(countFilePath, 'utf8'));
      console.log('Nombre d\'utilisateurs depuis fichier:', countData.count);
      return NextResponse.json({ count: countData.count });
    } else {
      // Si le fichier n'existe pas, créer avec la valeur par défaut
      const defaultCount = { count: 1785, lastUpdated: new Date().toISOString() };
      fs.writeFileSync(countFilePath, JSON.stringify(defaultCount, null, 2));
      console.log('Fichier de compteur créé avec valeur par défaut:', defaultCount.count);
      return NextResponse.json({ count: defaultCount.count });
    }
  } catch (error) {
    console.error("Erreur API /api/users/count:", error);
    return NextResponse.json({ 
      error: "Erreur lors du chargement du nombre d'utilisateurs",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 