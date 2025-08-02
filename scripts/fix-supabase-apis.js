const fs = require('fs');
const path = require('path');

// Fonction pour corriger une API Supabase
function fixSupabaseAPI(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si le fichier contient une initialisation Supabase problématique
    if (content.includes('process.env.NEXT_PUBLIC_SUPABASE_URL!')) {
      console.log(`Correction de: ${filePath}`);
      
      // Remplacer l'initialisation problématique
      content = content.replace(
        /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL!;/g,
        `const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;`
      );
      
      content = content.replace(
        /const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!;/g,
        `const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;`
      );
      
      content = content.replace(
        /const supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY!;/g,
        `const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;`
      );
      
      // Ajouter la vérification et les valeurs par défaut
      const checkCode = `
// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes dans ${path.basename(filePath)}:', {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey
  });
}

// Client Supabase côté serveur
const supabase = createClient(
  supabaseUrl || 'https://jdemxmntzsetwrhzzknl.supabase.co',
  supabaseAnonKey || 'sb_publishable_W8PK0Nvw_TBQkPfvJKoOTw_CYTRacwN'
);`;
      
      // Remplacer l'ancienne initialisation
      content = content.replace(
        /\/\/ Client Supabase côté serveur\s+const supabase = createClient\(supabaseUrl, supabaseAnonKey\);/g,
        checkCode
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} corrigé`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
  }
}

// Fonction pour scanner récursivement les dossiers
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      fixSupabaseAPI(filePath);
    }
  });
}

// Démarrer la correction
console.log('🔧 Correction des APIs Supabase...');
scanDirectory('./app/api');
console.log('✅ Correction terminée !'); 