const fs = require('fs');
const path = require('path');

console.log('🧹 Création d\'un projet Android Studio propre...\n');

// Configuration du projet
const projectConfig = {
  appName: 'BE_STRONG',
  packageName: 'com.bestrong.app',
  versionName: '1.2.0',
  versionCode: 3,
  targetSdk: 34,
  minSdk: 21,
  compileSdk: 34,
  websiteUrl: 'https://mybestrong.netlify.app'
};

// Créer la structure du projet
const projectStructure = {
  'BE_STRONG_APP': {
    'app': {
      'src': {
        'main': {
          'java': {
            'com': {
              'bestrong': {
                'app': {
                  'MainActivity.java': generateMainActivity(),
                  'SplashActivity.java': generateSplashActivity(),
                  'ShareHelper.java': generateShareHelper()
                }
              }
            }
          },
          'res': {
            'layout': {
              'activity_main.xml': generateMainLayout(),
              'activity_splash.xml': generateSplashLayout()
            },
            'values': {
              'strings.xml': generateStrings(),
              'colors.xml': generateColors(),
              'themes.xml': generateThemes()
            },
            'drawable': {
              'splash_background.xml': generateSplashBackground()
            },
            'mipmap-hdpi': {},
            'mipmap-mdpi': {},
            'mipmap-xhdpi': {},
            'mipmap-xxhdpi': {},
            'mipmap-xxxhdpi': {}
          },
          'AndroidManifest.xml': generateManifest()
        }
      },
      'build.gradle': generateAppBuildGradle()
    },
    'build.gradle': generateProjectBuildGradle(),
    'settings.gradle': generateSettingsGradle(),
    'gradle.properties': generateGradleProperties(),
    'local.properties': generateLocalProperties(),
    'gradlew': generateGradlew(),
    'gradlew.bat': generateGradlewBat(),
    'gradle': {
      'wrapper': {
        'gradle-wrapper.properties': generateGradleWrapperProperties()
      }
    }
  }
};

function generateMainActivity() {
  return `package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.util.Log;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;
    private RelativeLayout container;
    private ShareHelper shareHelper;
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Créer le layout
        container = new RelativeLayout(this);
        setContentView(container);
        
        // Initialiser le helper de partage
        shareHelper = new ShareHelper(this);
        
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
            8
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
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // Configuration du client WebView
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                Log.d(TAG, "Loading URL: " + url);
                
                // URL de base de l'application
                String baseUrl = "${projectConfig.websiteUrl}";
                
                // Gérer les liens externes
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("sms:")) {
                    // Liens de communication - ouvrir dans les apps natives
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, request.getUrl());
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error opening external link", e);
                    }
                } else if (url.startsWith("http://") || url.startsWith("https://")) {
                    // Liens web
                    if (url.startsWith(baseUrl)) {
                        // Liens internes - charger dans le WebView
                        Log.d(TAG, "Internal link: " + url);
                        view.loadUrl(url);
                        return true;
                    } else {
                        // Liens externes - ouvrir dans le navigateur
                        Log.d(TAG, "External link: " + url);
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                            return true;
                        } catch (Exception e) {
                            Log.e(TAG, "Error opening external web link", e);
                        }
                    }
                }
                
                // Par défaut, charger dans le WebView (liens internes)
                Log.d(TAG, "Loading in WebView: " + url);
                view.loadUrl(url);
                return true;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                Log.d(TAG, "Page loaded: " + url);
                
                // Injecter le JavaScript pour le partage natif
                injectShareJavaScript();
            }
            
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                Log.e(TAG, "WebView error: " + error.getDescription());
            }
        });
        
        // Configuration du Chrome Client
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
        webView.loadUrl("${projectConfig.websiteUrl}");
    }
    
    private void injectShareJavaScript() {
        String js = "// API de partage natif pour Android\\n" +
            "window.AndroidShare = {\\n" +
            "    share: function(title, text, url) {\\n" +
            "        Android.shareContent(title, text, url);\\n" +
            "    }\\n" +
            "};\\n" +
            "\\n" +
            "// Override du bouton de partage\\n" +
            "document.addEventListener('click', function(e) {\\n" +
            "    if (e.target && e.target.closest('button') && \\n" +
            "        e.target.closest('button').textContent.includes('Partager BE STRONG')) {\\n" +
            "        e.preventDefault();\\n" +
            "        \\n" +
            "        const shareData = {\\n" +
            "            title: '🚀 Rejoins BE STRONG et deviens une légende !',\\n" +
            "            text: '🔥 Découvre BE STRONG : la plateforme éthique qui booste ta visibilité TikTok !',\\n" +
            "            url: '${projectConfig.websiteUrl}'\\n" +
            "        };\\n" +
            "        \\n" +
            "        if (window.AndroidShare) {\\n" +
            "            window.AndroidShare.share(shareData.title, shareData.text, shareData.url);\\n" +
            "        } else if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {\\n" +
            "            navigator.share(shareData);\\n" +
            "        } else {\\n" +
            "            const message = shareData.title + '\\\\n\\\\n' + shareData.text + ' ' + shareData.url;\\n" +
            "            if (navigator.clipboard) {\\n" +
            "                navigator.clipboard.writeText(message);\\n" +
            "                alert('✅ Lien copié !');\\n" +
            "            } else {\\n" +
            "                alert('📱 Partage BE STRONG:\\\\n\\\\n' + message);\\n" +
            "            }\\n" +
            "        }\\n" +
            "    }\\n" +
            "});";
        
        webView.evaluateJavascript(js, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                Log.d(TAG, "JavaScript injected successfully");
            }
        });
    }
    
    // Méthode appelée depuis JavaScript
    public void shareContent(String title, String text, String url) {
        shareHelper.shareContent(title, text, url);
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
}

function generateSplashActivity() {
  return `package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;
import android.graphics.Color;
import android.view.View;
import android.widget.RelativeLayout;

public class SplashActivity extends Activity {
    private static final int SPLASH_DURATION = 3000; // 3 secondes
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Créer le layout du splash screen
        RelativeLayout splashLayout = new RelativeLayout(this);
        splashLayout.setBackgroundColor(Color.parseColor("#1F2937")); // Gris foncé
        
        // Logo animé
        ImageView logoView = new ImageView(this);
        logoView.setImageResource(R.drawable.ic_launcher_foreground);
        logoView.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
        
        RelativeLayout.LayoutParams logoParams = new RelativeLayout.LayoutParams(
            200, 200
        );
        logoParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        logoParams.addRule(RelativeLayout.ABOVE, android.R.id.text1);
        
        // Texte animé
        TextView titleText = new TextView(this);
        titleText.setText("BE STRONG");
        titleText.setTextSize(32);
        titleText.setTextColor(Color.parseColor("#EC4899")); // Rose
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        
        RelativeLayout.LayoutParams titleParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.WRAP_CONTENT,
            RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        titleParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
        titleParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        titleParams.topMargin = 50;
        
        // Sous-titre
        TextView subtitleText = new TextView(this);
        subtitleText.setText("Augmentez votre visibilité TikTok");
        subtitleText.setTextSize(16);
        subtitleText.setTextColor(Color.parseColor("#9CA3AF")); // Gris clair
        subtitleText.setTypeface(android.graphics.Typeface.DEFAULT);
        
        RelativeLayout.LayoutParams subtitleParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.WRAP_CONTENT,
            RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        subtitleParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
        subtitleParams.addRule(RelativeLayout.BELOW, android.R.id.text1);
        subtitleParams.topMargin = 20;
        
        // Ajouter les vues
        splashLayout.addView(logoView, logoParams);
        splashLayout.addView(titleText, titleParams);
        splashLayout.addView(subtitleText, subtitleParams);
        
        setContentView(splashLayout);
        
        // Animations
        Animation fadeIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
        Animation scaleIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
        
        logoView.startAnimation(fadeIn);
        titleText.startAnimation(scaleIn);
        subtitleText.startAnimation(fadeIn);
        
        // Délai avant de passer à MainActivity
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(SplashActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        }, SPLASH_DURATION);
    }
}`;
}

function generateShareHelper() {
  return `package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.widget.Toast;
import android.util.Log;

public class ShareHelper {
    private Activity activity;
    private static final String TAG = "ShareHelper";
    
    public ShareHelper(Activity activity) {
        this.activity = activity;
    }
    
    public void shareContent(String title, String text, String url) {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
            shareIntent.putExtra(Intent.EXTRA_TEXT, text + " " + url);
            
            // Créer un chooser pour sélectionner l'app de partage
            Intent chooser = Intent.createChooser(shareIntent, "Partager BE STRONG");
            
            // Vérifier qu'il y a des apps disponibles
            if (shareIntent.resolveActivity(activity.getPackageManager()) != null) {
                activity.startActivity(chooser);
                Log.d(TAG, "Share intent launched successfully");
            } else {
                Toast.makeText(activity, "Aucune application de partage disponible", Toast.LENGTH_SHORT).show();
                Log.w(TAG, "No sharing apps available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sharing content", e);
            Toast.makeText(activity, "Erreur lors du partage", Toast.LENGTH_SHORT).show();
        }
    }
}`;
}

function generateMainLayout() {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@android:color/white">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="8dp"
        android:layout_alignParentTop="true"
        android:visibility="gone" />

</RelativeLayout>`;
}

function generateSplashLayout() {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@drawable/splash_background"
    android:padding="32dp">

    <ImageView
        android:id="@+id/logo"
        android:layout_width="200dp"
        android:layout_height="200dp"
        android:layout_centerInParent="true"
        android:layout_above="@+id/title"
        android:src="@drawable/ic_launcher_foreground"
        android:scaleType="centerInside" />

    <TextView
        android:id="@+id/title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:text="BE STRONG"
        android:textSize="32sp"
        android:textColor="#EC4899"
        android:textStyle="bold"
        android:layout_marginTop="50dp" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@+id/title"
        android:layout_centerHorizontal="true"
        android:layout_marginTop="20dp"
        android:text="Augmentez votre visibilité TikTok"
        android:textSize="16sp"
        android:textColor="#9CA3AF" />

</RelativeLayout>`;
}

function generateStrings() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${projectConfig.appName}</string>
    <string name="share_title">Partager BE STRONG</string>
    <string name="share_text">Découvre BE STRONG : la plateforme éthique qui booste ta visibilité TikTok !</string>
    <string name="share_url">${projectConfig.websiteUrl}</string>
    <string name="splash_title">BE STRONG</string>
    <string name="splash_subtitle">Augmentez votre visibilité TikTok</string>
</resources>`;
}

function generateColors() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#EC4899</color>
    <color name="primary_dark">#BE185D</color>
    <color name="accent">#8B5CF6</color>
    <color name="background">#1F2937</color>
    <color name="surface">#374151</color>
    <color name="text_primary">#F9FAFB</color>
    <color name="text_secondary">#9CA3AF</color>
</resources>`;
}

function generateThemes() {
  return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary_dark</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:windowBackground">@color/background</item>
        <item name="android:statusBarColor">@color/primary_dark</item>
        <item name="android:navigationBarColor">@color/primary_dark</item>
    </style>
    
    <style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@color/background</item>
        <item name="android:statusBarColor">@color/background</item>
        <item name="android:navigationBarColor">@color/background</item>
        <item name="android:windowFullscreen">true</item>
    </style>
</resources>`;
}

function generateSplashBackground() {
  return `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:startColor="#1F2937"
        android:endColor="#374151"
        android:angle="45" />
</shape>`;
}

function generateManifest() {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${projectConfig.packageName}">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">

        <!-- Splash Activity -->
        <activity
            android:name=".SplashActivity"
            android:exported="true"
            android:theme="@style/SplashTheme"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Main Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="false"
            android:theme="@style/AppTheme"
            android:screenOrientation="portrait"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize" />

    </application>

</manifest>`;
}

function generateAppBuildGradle() {
  return `plugins {
    id 'com.android.application'
}

android {
    namespace '${projectConfig.packageName}'
    compileSdk ${projectConfig.compileSdk}

    defaultConfig {
        applicationId "${projectConfig.packageName}"
        minSdk ${projectConfig.minSdk}
        targetSdk ${projectConfig.targetSdk}
        versionCode ${projectConfig.versionCode}
        versionName "${projectConfig.versionName}"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
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
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`;
}

function generateProjectBuildGradle() {
  return `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '8.1.0' apply false
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`;
}

function generateSettingsGradle() {
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BE_STRONG_APP"
include ':app'`;
}

function generateGradleProperties() {
  return `# Project-wide Gradle settings.
# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.
# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html
# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true
# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true
# Enables namespacing of each library's R class so that its R class includes only the
# resources declared in the library itself and none from the library's dependencies,
# thereby reducing the size of the R class for that library
android.nonTransitiveRClass=true`;
}

function generateLocalProperties() {
  return `## This file must *NOT* be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=E:\\Android\\Sdk`;
}

function generateGradlew() {
  return `#!/usr/bin/env sh

#
# Copyright 2015 the original author or authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

##############################################################################
##
##  Gradle start up script for UN*X
##
##############################################################################

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
PRG="$0"
# Need this for relative symlinks.
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
SAVED="\${PWD}"
PWD=\`pwd\`
APP_HOME=\`dirname "$PRG"\` > /dev/null
cd "\${APP_HOME}" > /dev/null
APP_HOME=\`pwd\`
cd "\${SAVED}" > /dev/null

APP_NAME="Gradle"
APP_BASE_NAME=\`basename "$0"\`

# Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD="maximum"

warn () {
    echo "$*"
}

die () {
    echo
    echo "$*"
    echo
    exit 1
}

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "\`uname\`" in
  CYGWIN* )
    cygwin=true
    ;;
  Darwin* )
    darwin=true
    ;;
  MINGW* )
    msys=true
    ;;
  NONSTOP* )
    nonstop=true
    ;;
esac

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar


# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Increase the maximum file descriptors if we can.
if [ "$cygwin" = "false" -a "$darwin" = "false" -a "$nonstop" = "false" ] ; then
    MAX_FD_LIMIT=\`ulimit -H -n\`
    if [ $? -eq 0 ] ; then
        if [ "$MAX_FD" = "maximum" -o "$MAX_FD" = "max" ] ; then
            MAX_FD="$MAX_FD_LIMIT"
        fi
        ulimit -n $MAX_FD
        if [ $? -ne 0 ] ; then
            warn "Could not set maximum file descriptor limit: $MAX_FD"
        fi
    else
        warn "Could not query maximum file descriptor limit: $MAX_FD_LIMIT"
    fi
fi

# For Darwin, add options to specify how the application appears in the dock
if $darwin; then
    GRADLE_OPTS="$GRADLE_OPTS \\"-Xdock:name=$APP_NAME\\" \\"-Xdock:icon=$APP_HOME/media/gradle.icns\\""
fi

# For Cygwin or MSYS, switch paths to Windows format before running java
if [ "$cygwin" = "true" -o "$msys" = "true" ] ; then
    APP_HOME=\`cygpath --path --mixed "$APP_HOME"\`
    CLASSPATH=\`cygpath --path --mixed "$CLASSPATH"\`

    JAVACMD=\`cygpath --unix "$JAVACMD"\`

    # We build the pattern for arguments to be converted via cygpath
    ROOTDIRSRAW=\`find -L / -maxdepth 1 -mindepth 1 -type d 2>/dev/null\`
    SEP=""
    for dir in $ROOTDIRSRAW ; do
        ROOTDIRS="$ROOTDIRS$SEP$dir"
        SEP="|"
    done
    OURCYGPATTERN="(^($ROOTDIRS))"
    # Add a user-defined pattern to the cygpath arguments
    if [ "$GRADLE_CYGPATTERN" != "" ] ; then
        OURCYGPATTERN="$OURCYGPATTERN|($GRADLE_CYGPATTERN)"
    fi
    # Now convert the arguments - kludge to limit ourselves to /bin/sh
    i=0
    for arg in "$@" ; do
        CHECK=\`echo "$arg"|egrep -c "$OURCYGPATTERN" -\`
        CHECK2=\`echo "$arg"|egrep -c "^-"\`                                 ### Determine if an option

        if [ $CHECK -ne 0 ] && [ $CHECK2 -eq 0 ] ; then                    ### Added a condition
            eval \`echo args$i\`=\`cygpath --path --ignore --mixed "$arg"\`
        else
            eval \`echo args$i\`="\\"$arg\\""
        fi
        i=\`expr $i + 1\`
    done
    case $i in
        0) set -- ;;
        1) set -- "$args0" ;;
        2) set -- "$args0" "$args1" ;;
        3) set -- "$args0" "$args1" "$args2" ;;
        4) set -- "$args0" "$args1" "$args2" "$args3" ;;
        5) set -- "$args0" "$args1" "$args2" "$args3" "$args4" ;;
        6) set -- "$args0" "$args1" "$args2" "$args3" "$args4" "$args5" ;;
        7) set -- "$args0" "$args1" "$args2" "$args3" "$args4" "$args5" "$args6" ;;
        8) set -- "$args0" "$args1" "$args2" "$args3" "$args4" "$args5" "$args6" "$args7" ;;
        9) set -- "$args0" "$args1" "$args2" "$args3" "$args4" "$args5" "$args6" "$args7" "$args8" ;;
    esac
fi

# Escape application args
save () {
    for i do printf %s\\n "$i" | sed "s/'/'\\\\''/g;1s/^/'/;\$s/\$/' \\\\/" ; done
    echo " "
}
APP_ARGS=\`save "$@"\`

# Collect all arguments for the java command, following the shell quoting and substitution rules
eval set -- $DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS "\\"-Dorg.gradle.appname=$APP_BASE_NAME\\"" -classpath "\\"$CLASSPATH\\"" org.gradle.wrapper.GradleWrapperMain "$APP_ARGS"

exec "$JAVACMD" "$@"`;
}

function generateGradlewBat() {
  return `@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%" == "" @echo off
@rem ##########################################################################
@rem
@rem  Gradle startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar


@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd_ return code when the batch file is called from a command line.
if not "" == "%GRADLE_EXIT_CONSOLE%" exit 1
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega`;
}

function generateGradleWrapperProperties() {
  return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.0-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`;
}

// Fonction pour créer récursivement les dossiers et fichiers
function createProjectStructure(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = path.join(basePath, name);
    
    if (content === null) {
      // Créer le dossier
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Créé: ${fullPath}`);
      }
    } else if (typeof content === 'object') {
      // Créer le dossier et continuer récursivement
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Créé: ${fullPath}`);
      }
      createProjectStructure(fullPath, content);
    } else {
      // Créer le fichier
      fs.writeFileSync(fullPath, content);
      console.log(`📄 Créé: ${fullPath}`);
    }
  }
}

// Fonction principale
function createCleanProject() {
  console.log('🧹 Création d\'un projet Android Studio propre...');
  console.log('📱 Configuration:', projectConfig);
  
  // Créer la structure du projet
  createProjectStructure('.', projectStructure);
  
  console.log('\n✅ Projet Android Studio propre généré avec succès !');
  console.log('\n📋 Instructions :');
  console.log('1. Ouvrir Android Studio');
  console.log('2. File > Open > Sélectionner: ./BE_STRONG_APP');
  console.log('3. Attendre la synchronisation Gradle');
  console.log('4. Build > Build Bundle(s) / APK(s) > Build APK(s)');
  console.log('\n🎯 Fonctionnalités incluses :');
  console.log('✅ Partage natif Android');
  console.log('✅ Écran de démarrage animé');
  console.log('✅ Gestion intelligente des liens (interne/externe)');
  console.log('✅ Interface moderne BE STRONG');
  console.log('✅ Projet compatible Android Studio');
}

// Exécuter la génération
createCleanProject(); 