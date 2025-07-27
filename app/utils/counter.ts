import fs from 'fs';
import path from 'path';

// Chemin vers le fichier de compteur
const countFilePath = path.join(process.cwd(), 'data', 'users_count.json');

export function incrementUserCount(): number {
  try {
    // Lire le fichier de compteur
    if (fs.existsSync(countFilePath)) {
      const countData = JSON.parse(fs.readFileSync(countFilePath, 'utf8'));
      const newCount = countData.count + 1;
      
      // Mettre à jour le fichier
      const updatedData = {
        count: newCount,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(countFilePath, JSON.stringify(updatedData, null, 2));
      console.log('Compteur d\'utilisateurs incrémenté:', newCount);
      return newCount;
    } else {
      // Si le fichier n'existe pas, créer avec la valeur par défaut + 1
      const defaultCount = { count: 1786, lastUpdated: new Date().toISOString() };
      fs.writeFileSync(countFilePath, JSON.stringify(defaultCount, null, 2));
      console.log('Fichier de compteur créé avec valeur par défaut + 1:', defaultCount.count);
      return defaultCount.count;
    }
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    return 1785; // Valeur de fallback
  }
}

export function getUserCount(): number {
  try {
    if (fs.existsSync(countFilePath)) {
      const countData = JSON.parse(fs.readFileSync(countFilePath, 'utf8'));
      return countData.count;
    } else {
      return 1785; // Valeur par défaut
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du compteur:', error);
    return 1785; // Valeur de fallback
  }
} 