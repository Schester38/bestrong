const fs = require('fs');
const path = require('path');

// Configuration de l'APK
const APK_CONFIG = {
  appName: 'BE STRONG',
  version: '1.1.1',
  url: 'https://mybestrong.netlify.app/',
  packageName: 'com.bestrong.app',
  description: 'Plateforme éthique pour augmenter votre visibilité TikTok'
};

// Créer le fichier de configuration
const configContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${APK_CONFIG.packageName}"
    android:versionCode="111"
    android:versionName="${APK_CONFIG.version}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${APK_CONFIG.appName}"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

// Créer le fichier MainActivity.java
const mainActivityContent = `package ${APK_CONFIG.packageName};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        
        webView.setWebViewClient(new WebViewClient());
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
}`;

// Créer le fichier strings.xml
const stringsContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${APK_CONFIG.appName}</string>
    <string name="app_description">${APK_CONFIG.description}</string>
</resources>`;

// Créer le fichier build.gradle
const buildGradleContent = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "${APK_CONFIG.packageName}"
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
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}`;

console.log('✅ Configuration APK créée !');
console.log(`📱 App: ${APK_CONFIG.appName} v${APK_CONFIG.version}`);
console.log(`🌐 URL: ${APK_CONFIG.url}`);
console.log(`📦 Package: ${APK_CONFIG.packageName}`);

// Créer le dossier de sortie
const outputDir = path.join(__dirname, 'android-app');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Écrire les fichiers
fs.writeFileSync(path.join(outputDir, 'AndroidManifest.xml'), configContent);
fs.writeFileSync(path.join(outputDir, 'MainActivity.java'), mainActivityContent);
fs.writeFileSync(path.join(outputDir, 'strings.xml'), stringsContent);
fs.writeFileSync(path.join(outputDir, 'build.gradle'), buildGradleContent);

console.log('📁 Fichiers Android créés dans le dossier "android-app"');
console.log('🔨 Pour compiler l\'APK, ouvrez le dossier dans Android Studio');
console.log('📱 Ou utilisez: ./gradlew assembleRelease'); 