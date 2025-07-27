const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Génération de l\'APK BE STRONG v1.1.1...');

// Configuration
const APP_URL = 'https://mybestrong.netlify.app/';
const APP_NAME = 'BE STRONG';
const PACKAGE_NAME = 'com.bestrong.app';

try {
  // Vérifier si Bubblewrap est installé
  console.log('📦 Vérification de Bubblewrap...');
  execSync('bubblewrap --version', { stdio: 'pipe' });
  console.log('✅ Bubblewrap est installé');

  // Créer le dossier de travail
  const workDir = path.join(__dirname, 'bubblewrap-app');
  if (fs.existsSync(workDir)) {
    fs.rmSync(workDir, { recursive: true });
  }
  fs.mkdirSync(workDir, { recursive: true });

  // Initialiser le projet Bubblewrap
  console.log('🔧 Initialisation du projet Bubblewrap...');
  execSync(`bubblewrap init --manifest ${APP_URL}manifest.json --directory ${workDir}`, {
    cwd: workDir,
    stdio: 'inherit'
  });

  // Configurer l'application
  console.log('⚙️ Configuration de l\'application...');
  const configPath = path.join(workDir, 'app.json');
  const config = {
    packageId: PACKAGE_NAME,
    appName: APP_NAME,
    appVersionName: '1.1.1',
    appVersionCode: 111,
    host: 'mybestrong.netlify.app',
    scheme: 'https',
    webManifestUrl: `${APP_URL}manifest.json`,
    startUrl: '/',
    display: 'standalone',
    themeColor: '#3b82f6',
    backgroundColor: '#ffffff',
    enableNotifications: true,
    enableShortcuts: true,
    shortcuts: [
      {
        name: 'Dashboard',
        shortName: 'Dashboard',
        url: '/dashboard',
        icons: [{ src: '/icon.png', sizes: '192x192' }]
      }
    ]
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // Construire l'APK
  console.log('🔨 Construction de l\'APK...');
  execSync('bubblewrap build', {
    cwd: workDir,
    stdio: 'inherit'
  });

  // Copier l'APK vers le dossier public
  const apkSource = path.join(workDir, 'app-release-signed.apk');
  const apkDest = path.join(__dirname, 'public', 'apk', 'BE_STRONG_v1.1.1.apk');

  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDest);
    console.log('✅ APK généré avec succès !');
    console.log(`📱 Fichier: ${apkDest}`);
    console.log(`📦 Taille: ${(fs.statSync(apkDest).size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log('❌ APK non trouvé dans le dossier de sortie');
  }

} catch (error) {
  console.log('❌ Erreur lors de la génération de l\'APK:');
  console.log(error.message);
  
  console.log('\n📋 Instructions manuelles:');
  console.log('1. Installez Bubblewrap: npm install -g @bubblewrap/cli');
  console.log('2. Allez sur https://www.pwabuilder.com/');
  console.log('3. Entrez l\'URL: https://mybestrong.netlify.app/');
  console.log('4. Cliquez sur "Build My PWA"');
  console.log('5. Téléchargez l\'APK généré');
} 