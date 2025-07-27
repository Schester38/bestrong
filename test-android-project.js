const fs = require('fs');
const path = require('path');

console.log('🔍 Test de la structure du projet Android Studio...\n');

// Vérifier les fichiers essentiels
const essentialFiles = [
  'android-app-complete/app/src/main/java/com/bestrong/app/MainActivity.java',
  'android-app-complete/app/src/main/java/com/bestrong/app/SplashActivity.java',
  'android-app-complete/app/src/main/java/com/bestrong/app/ShareHelper.java',
  'android-app-complete/app/src/main/java/com/bestrong/app/WebViewHelper.java',
  'android-app-complete/app/src/main/AndroidManifest.xml',
  'android-app-complete/app/src/main/res/layout/activity_main.xml',
  'android-app-complete/app/src/main/res/layout/activity_splash.xml',
  'android-app-complete/app/src/main/res/values/strings.xml',
  'android-app-complete/app/src/main/res/values/colors.xml',
  'android-app-complete/app/src/main/res/values/themes.xml',
  'android-app-complete/app/build.gradle',
  'android-app-complete/build.gradle',
  'android-app-complete/settings.gradle',
  'android-app-complete/gradle.properties',
  'android-app-complete/local.properties',
  'android-app-complete/gradlew',
  'android-app-complete/gradlew.bat',
  'android-app-complete/gradle/wrapper/gradle-wrapper.properties'
];

let allFilesExist = true;

console.log('📋 Vérification des fichiers essentiels :');
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

console.log('\n🔧 Vérification des fonctionnalités :');

// Vérifier le contenu de MainActivity.java
const mainActivityPath = 'android-app-complete/app/src/main/java/com/bestrong/app/MainActivity.java';
if (fs.existsSync(mainActivityPath)) {
  const content = fs.readFileSync(mainActivityPath, 'utf8');
  
  const features = [
    { name: 'WebView Configuration', check: content.includes('WebSettings') },
    { name: 'JavaScript Enabled', check: content.includes('setJavaScriptEnabled(true)') },
    { name: 'Share Helper', check: content.includes('ShareHelper') },
    { name: 'Share JavaScript Injection', check: content.includes('injectShareJavaScript') },
    { name: 'AndroidShare API', check: content.includes('AndroidShare') },
    { name: 'Progress Bar', check: content.includes('ProgressBar') },
    { name: 'Back Navigation', check: content.includes('onBackPressed') }
  ];
  
  features.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
  });
}

// Vérifier le contenu de SplashActivity.java
const splashActivityPath = 'android-app-complete/app/src/main/java/com/bestrong/app/SplashActivity.java';
if (fs.existsSync(splashActivityPath)) {
  const content = fs.readFileSync(splashActivityPath, 'utf8');
  
  const splashFeatures = [
    { name: 'Splash Duration', check: content.includes('SPLASH_DURATION') },
    { name: 'Animation', check: content.includes('Animation') },
    { name: 'BE STRONG Text', check: content.includes('BE STRONG') },
    { name: 'Gradient Background', check: content.includes('Gradient') },
    { name: 'Auto Transition', check: content.includes('Intent') }
  ];
  
  console.log('\n🎨 Fonctionnalités Splash Screen :');
  splashFeatures.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
  });
}

// Vérifier le manifest
const manifestPath = 'android-app-complete/app/src/main/AndroidManifest.xml';
if (fs.existsSync(manifestPath)) {
  const content = fs.readFileSync(manifestPath, 'utf8');
  
  const manifestFeatures = [
    { name: 'Internet Permission', check: content.includes('android.permission.INTERNET') },
    { name: 'Splash Activity', check: content.includes('SplashActivity') },
    { name: 'Main Activity', check: content.includes('MainActivity') },
    { name: 'Theme Configuration', check: content.includes('theme') },
    { name: 'Package Name', check: content.includes('com.bestrong.app') }
  ];
  
  console.log('\n📱 Configuration AndroidManifest :');
  manifestFeatures.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
  });
}

// Vérifier les couleurs et thèmes
const colorsPath = 'android-app-complete/app/src/main/res/values/colors.xml';
if (fs.existsSync(colorsPath)) {
  const content = fs.readFileSync(colorsPath, 'utf8');
  
  const colorFeatures = [
    { name: 'Primary Color (Rose)', check: content.includes('#EC4899') },
    { name: 'Accent Color (Violet)', check: content.includes('#8B5CF6') },
    { name: 'Background Color', check: content.includes('#1F2937') }
  ];
  
  console.log('\n🎨 Configuration des couleurs :');
  colorFeatures.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
  });
}

// Vérifier les strings
const stringsPath = 'android-app-complete/app/src/main/res/values/strings.xml';
if (fs.existsSync(stringsPath)) {
  const content = fs.readFileSync(stringsPath, 'utf8');
  
  const stringFeatures = [
    { name: 'App Name', check: content.includes('BE STRONG') },
    { name: 'Share Title', check: content.includes('Partager BE STRONG') },
    { name: 'Website URL', check: content.includes('mybestrong.netlify.app') }
  ];
  
  console.log('\n📝 Configuration des textes :');
  stringFeatures.forEach(feature => {
    console.log(`${feature.check ? '✅' : '❌'} ${feature.name}`);
  });
}

console.log('\n📊 Résumé :');
if (allFilesExist) {
  console.log('✅ Tous les fichiers essentiels sont présents');
  console.log('✅ Structure du projet Android Studio complète');
  console.log('✅ Prêt pour la compilation dans Android Studio');
} else {
  console.log('❌ Certains fichiers sont manquants');
  console.log('❌ Vérifiez la génération du projet');
}

console.log('\n🚀 Prochaines étapes :');
console.log('1. Ouvrir Android Studio');
console.log('2. Importer le projet depuis: ./android-app-complete');
console.log('3. Synchroniser Gradle');
console.log('4. Compiler l\'APK');
console.log('\n📖 Consultez le guide: GUIDE_ANDROID_STUDIO_COMPLET.md'); 