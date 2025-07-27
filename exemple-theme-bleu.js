// Script pour appliquer le thème bleu à BE STRONG
// Exécutez ce script pour changer automatiquement les couleurs

const fs = require('fs');
const path = require('path');

console.log('🎨 Application du thème bleu à BE STRONG...');

// Configuration du thème bleu
const blueTheme = {
  gradient: 'from-blue-500 to-indigo-600',
  background: 'bg-gradient-to-br from-blue-900 to-indigo-800',
  text: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  hover: 'hover:text-blue-600',
  border: 'hover:border-blue-500',
};

// Fichiers à modifier
const filesToModify = [
  {
    path: 'app/page.tsx',
    changes: [
      {
        from: 'bg-gradient-to-r from-pink-500 to-purple-600',
        to: `bg-gradient-to-r ${blueTheme.gradient}`,
      },
      {
        from: 'bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent',
        to: `bg-gradient-to-r ${blueTheme.gradient} bg-clip-text text-transparent`,
      },
      {
        from: 'hover:text-pink-600',
        to: blueTheme.hover,
      },
      {
        from: 'hover:border-pink-500',
        to: blueTheme.border,
      },
    ],
  },
  {
    path: 'app/layout.tsx',
    changes: [
      {
        from: 'bg-gradient-to-br from-gray-900 to-gray-800',
        to: blueTheme.background,
      },
    ],
  },
  {
    path: 'app/dashboard/page.tsx',
    changes: [
      {
        from: 'bg-gradient-to-r from-pink-500 to-purple-600',
        to: `bg-gradient-to-r ${blueTheme.gradient}`,
      },
      {
        from: 'hover:text-pink-600',
        to: blueTheme.hover,
      },
    ],
  },
  {
    path: 'app/admin/page.tsx',
    changes: [
      {
        from: 'bg-gradient-to-r from-pink-500 to-purple-600',
        to: `bg-gradient-to-r ${blueTheme.gradient}`,
      },
    ],
  },
];

// Fonction pour appliquer les changements
function applyThemeChanges() {
  filesToModify.forEach(file => {
    try {
      const filePath = path.join(__dirname, file.path);
      let content = fs.readFileSync(filePath, 'utf8');
      
      file.changes.forEach(change => {
        content = content.replace(new RegExp(change.from, 'g'), change.to);
      });
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${file.path} modifié`);
    } catch (error) {
      console.log(`❌ Erreur lors de la modification de ${file.path}:`, error.message);
    }
  });
}

// Fonction pour créer un backup
function createBackup() {
  const backupDir = path.join(__dirname, 'backup-theme');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  filesToModify.forEach(file => {
    try {
      const sourcePath = path.join(__dirname, file.path);
      const backupPath = path.join(backupDir, path.basename(file.path));
      fs.copyFileSync(sourcePath, backupPath);
    } catch (error) {
      console.log(`⚠️ Impossible de sauvegarder ${file.path}`);
    }
  });
  
  console.log('📁 Backup créé dans le dossier "backup-theme"');
}

// Exécution
console.log('📁 Création du backup...');
createBackup();

console.log('🎨 Application des changements...');
applyThemeChanges();

console.log('✅ Thème bleu appliqué avec succès !');
console.log('🚀 Déployez les changements avec : git add . && git commit -m "Thème bleu" && git push');
console.log('📱 Vérifiez sur : https://mybestrong.netlify.app/'); 