const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration de l'APK propre
const APK_CONFIG = {
  appName: 'BE STRONG',
  version: '1.1.1',
  url: 'https://mybestrong.netlify.app/',
  packageName: 'com.bestrong.app.clean',
  description: 'Plateforme éthique pour augmenter votre visibilité TikTok - Version Propre'
};

console.log('🚀 Génération d\'un APK propre sans publicités...');

// Créer la structure du projet Android
const createAndroidProject = () => {
  const projectDir = path.join(__dirname, 'clean-android-app');
  
  // Créer la structure des dossiers
  const dirs = [
    'app/src/main/java/com/bestrong/app/clean',
    'app/src/main/res/layout',
    'app/src/main/res/values',
    'app/src/main/res/drawable',
    'app/src/main/res/mipmap-hdpi',
    'app/src/main/res/mipmap-mdpi',
    'app/src/main/res/mipmap-xhdpi',
    'app/src/main/res/mipmap-xxhdpi',
    'app/src/main/res/mipmap-xxxhdpi'
  ];
  
  dirs.forEach(dir => {
    const fullPath = path.join(projectDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  
  return projectDir;
};

// Créer le MainActivity.java propre
const createMainActivity = (projectDir) => {
  const mainActivityContent = `package com.bestrong.app.clean;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;
    private RelativeLayout container;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Créer le layout
        container = new RelativeLayout(this);
        setContentView(container);
        
        // Créer la WebView
        webView = new WebView(this);
        webView.setId(android.R.id.content);
        
        // Créer la barre de progression
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setId(android.R.id.progress);
        
        // Configuration du layout
        RelativeLayout.LayoutParams webViewParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.MATCH_PARENT,
            RelativeLayout.LayoutParams.MATCH_PARENT
        );
        
        RelativeLayout.LayoutParams progressParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.MATCH_PARENT,
            10
        );
        progressParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
        
        container.addView(webView, webViewParams);
        container.addView(progressBar, progressParams);
        
        // Configuration WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Permettre les liens externes et contenu mixte
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Configuration du client WebView
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Charger toutes les URLs dans la WebView
                view.loadUrl(url);
                return true;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }
        });
        
        // Configuration du Chrome Client pour la barre de progression
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }
        });
        
        // Charger l'URL
        webView.loadUrl("${APK_CONFIG.url}");
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }
}`;

  fs.writeFileSync(path.join(projectDir, 'app/src/main/java/com/bestrong/app/clean/MainActivity.java'), mainActivityContent);
};

// Créer le AndroidManifest.xml
const createManifest = (projectDir) => {
  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bestrong.app.clean"
    android:versionCode="111"
    android:versionName="${APK_CONFIG.version}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  fs.writeFileSync(path.join(projectDir, 'app/src/main/AndroidManifest.xml'), manifestContent);
};

// Créer les fichiers de ressources
const createResources = (projectDir) => {
  // strings.xml
  const stringsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${APK_CONFIG.appName}</string>
    <string name="app_description">${APK_CONFIG.description}</string>
</resources>`;

  // styles.xml
  const stylesContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">#3b82f6</item>
        <item name="colorPrimaryDark">#1d4ed8</item>
        <item name="colorAccent">#3b82f6</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>`;

  fs.writeFileSync(path.join(projectDir, 'app/src/main/res/values/strings.xml'), stringsContent);
  fs.writeFileSync(path.join(projectDir, 'app/src/main/res/values/styles.xml'), stylesContent);
};

// Créer le build.gradle de l'app
const createAppBuildGradle = (projectDir) => {
  const buildGradleContent = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.bestrong.app.clean"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 111
        versionName "${APK_CONFIG.version}"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}`;

  fs.writeFileSync(path.join(projectDir, 'app/build.gradle'), buildGradleContent);
};

// Créer le build.gradle principal
const createMainBuildGradle = (projectDir) => {
  const mainBuildGradleContent = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;

  fs.writeFileSync(path.join(projectDir, 'build.gradle'), mainBuildGradleContent);
};

// Créer settings.gradle
const createSettingsGradle = (projectDir) => {
  const settingsContent = `rootProject.name = "BE STRONG Clean"
include ':app'`;

  fs.writeFileSync(path.join(projectDir, 'settings.gradle'), settingsContent);
};

// Créer local.properties
const createLocalProperties = (projectDir) => {
  const localPropertiesContent = `## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=C\:\\Users\\EASYSTORE\\AppData\\Local\\Android\\Sdk`;

  fs.writeFileSync(path.join(projectDir, 'local.properties'), localPropertiesContent);
};

// Fonction principale
const generateCleanAPK = () => {
  try {
    console.log('📁 Création de la structure du projet...');
    const projectDir = createAndroidProject();
    
    console.log('📝 Création des fichiers Android...');
    createMainActivity(projectDir);
    createManifest(projectDir);
    createResources(projectDir);
    createAppBuildGradle(projectDir);
    createMainBuildGradle(projectDir);
    createSettingsGradle(projectDir);
    createLocalProperties(projectDir);
    
    console.log('✅ Projet Android propre créé !');
    console.log(`📱 App: ${APK_CONFIG.appName} v${APK_CONFIG.version}`);
    console.log(`🌐 URL: ${APK_CONFIG.url}`);
    console.log(`📦 Package: ${APK_CONFIG.packageName}`);
    console.log(`📁 Dossier: ${projectDir}`);
    
    console.log('\n🚀 Pour générer l\'APK :');
    console.log('1. Ouvrez Android Studio');
    console.log('2. Ouvrez le projet : ' + projectDir);
    console.log('3. Build → Build Bundle(s) / APK(s) → Build APK(s)');
    console.log('4. L\'APK sera dans : app/build/outputs/apk/debug/');
    
    console.log('\n🎯 Cet APK sera 100% propre sans publicités tierces !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
  }
};

// Exécuter la génération
generateCleanAPK(); 