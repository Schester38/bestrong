package com.bestrong.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    
    private WebView webView;
    private ProgressBar progressBar;
    private LinearLayout loadingLayout;
    private ShareHelper shareHelper;
    private ThemeManager themeManager;
    
    // Interface JavaScript pour communiquer avec le WebView
    public class WebAppInterface {
        MainActivity mContext;
        
        WebAppInterface(MainActivity context) {
            mContext = context;
        }
        
        @JavascriptInterface
        public void shareContent(String title, String text, String url) {
            mContext.shareContent(title, text, url);
        }
        
        @JavascriptInterface
        public void toggleTheme() {
            mContext.toggleTheme();
        }
        
        @JavascriptInterface
        public boolean isDarkMode() {
            return mContext.themeManager.isDarkMode(mContext);
        }
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Appliquer le thème avant de créer l'activité
        themeManager = new ThemeManager(this);
        themeManager.applyCurrentTheme();
        
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialiser les vues
        initializeViews();
        
        // Initialiser le helper de partage
        shareHelper = new ShareHelper(this);
        
        // Initialiser le WebView
        initializeWebView();
        
        // Initialiser le helper de partage
        initializeShareHelper();
        
        // Afficher le dialog de motivation après un délai
        showMotivationalDialog();
    }
    
    private void initializeViews() {
        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);
        loadingLayout = findViewById(R.id.loadingLayout);
    }
    
    private void initializeWebView() {
        // Configuration du WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Ajouter l'interface JavaScript
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        
        // Gestion des liens externes
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // URL de base de l'application
                String baseUrl = "https://mybestrong.netlify.app";
                
                // Gérer les liens de communication
                if (url.startsWith("tel:") || url.startsWith("mailto:") || 
                    url.startsWith("whatsapp:") || url.startsWith("sms:")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Impossible d'ouvrir cette application", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                
                // Gérer les liens web externes
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    if (url.startsWith(baseUrl)) {
                        // Liens internes - charger dans le WebView
                        view.loadUrl(url);
                        return true;
                    } else {
                        // Liens externes - ouvrir dans le navigateur
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            startActivity(intent);
                            return true;
                        } catch (Exception e) {
                            Toast.makeText(MainActivity.this, "Impossible d'ouvrir ce lien", Toast.LENGTH_SHORT).show();
                            return true;
                        }
                    }
                }
                
                // Gérer les liens intent Android
                if (url.startsWith("intent://")) {
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Impossible d'ouvrir cette application", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                
                return false;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Masquer l'indicateur de chargement
                loadingLayout.setVisibility(View.GONE);
                progressBar.setVisibility(View.GONE);
                
                // Injecter le thème dans le WebView
                injectThemeScript();
                
                // Modifier le header pour supprimer l'icône et déplacer BE STRONG vers la gauche
                injectHeaderModificationScript();
            }
        });
        
        // Gestion des alertes JavaScript et de la progression
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
        webView.loadUrl("https://mybestrong.netlify.app");
    }
    
    private void injectThemeScript() {
        boolean isDark = themeManager.isDarkMode(this);
        String themeScript = "javascript:" +
            "document.documentElement.setAttribute('data-theme', '" + (isDark ? "dark" : "light") + "');" +
            "document.body.classList.toggle('dark-mode', " + isDark + ");";
        
        webView.evaluateJavascript(themeScript, null);
    }
    
    private void injectHeaderModificationScript() {
        String headerScript = "javascript:" +
            "setTimeout(function() {" +
            "   // Supprimer l'icône du header" +
            "   var header = document.querySelector('header');" +
            "   if (header) {" +
            "       var logoImg = header.querySelector('img[src*=\"icon-512\"]');" +
            "       if (logoImg) {" +
            "           logoImg.style.display = 'none';" +
            "       }" +
            "       " +
            "       // Déplacer BE STRONG vers la gauche" +
            "       var titleElement = header.querySelector('h1');" +
            "       if (titleElement) {" +
            "           titleElement.style.marginLeft = '0';" +
            "           titleElement.style.textAlign = 'left';" +
            "           titleElement.style.justifyContent = 'flex-start';" +
            "       }" +
            "       " +
            "       // Ajuster le conteneur du titre" +
            "       var titleContainer = header.querySelector('.flex.items-center');" +
            "       if (titleContainer) {" +
            "           titleContainer.style.justifyContent = 'flex-start';" +
            "           titleContainer.style.marginLeft = '0';" +
            "       }" +
            "   }" +
            "}, 1000);";
        
        webView.evaluateJavascript(headerScript, null);
    }
    
    private void initializeShareHelper() {
        // Injection JavaScript pour le partage natif
        String shareScript = "javascript:" +
            "window.AndroidShare = {" +
            "   share: function(title, text, url) {" +
            "       Android.shareContent(title, text, url);" +
            "   }" +
            "};" +
            "" +
            "// Override du bouton de partage" +
            "document.addEventListener('click', function(e) {" +
            "   if (e.target && e.target.closest('button') && " +
            "       e.target.closest('button').textContent.includes('Partager BE STRONG')) {" +
            "       e.preventDefault();" +
            "       " +
            "       var shareData = {" +
            "           title: 'BE STRONG'," +
            "           text: 'Decouvre BE STRONG : la plateforme ethique qui booste ta visibilite TikTok'," +
            "           url: 'https://mybestrong.netlify.app'" +
            "       };" +
            "       " +
            "       if (window.AndroidShare) {" +
            "           window.AndroidShare.share(shareData.title, shareData.text, shareData.url);" +
            "       } else if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {" +
            "           navigator.share(shareData);" +
            "       } else {" +
            "           // Fallback vers copie" +
            "           var message = shareData.title + '\\n\\n' + shareData.text + ' ' + shareData.url;" +
            "           if (navigator.clipboard) {" +
            "               navigator.clipboard.writeText(message);" +
            "               alert('Lien copie ! Partage-le avec tes amis');" +
            "           } else {" +
            "               alert('Partage BE STRONG:\\n\\n' + message);" +
            "           }" +
            "       }" +
            "   }" +
            "});";
        
        webView.evaluateJavascript(shareScript, null);
    }
    
    // Méthode appelée depuis JavaScript
    public void shareContent(String title, String text, String url) {
        shareHelper.shareContent(title, text, url);
    }
    
    public void toggleTheme() {
        int currentMode = themeManager.getThemeMode();
        int newMode;
        
        switch (currentMode) {
            case ThemeManager.THEME_LIGHT:
                newMode = ThemeManager.THEME_DARK;
                break;
            case ThemeManager.THEME_DARK:
                newMode = ThemeManager.THEME_SYSTEM;
                break;
            default:
                newMode = ThemeManager.THEME_LIGHT;
                break;
        }
        
        themeManager.setThemeMode(newMode);
        recreate(); // Recréer l'activité pour appliquer le nouveau thème
    }
    
    private void showMotivationalDialog() {
        // Afficher le dialog après 2 secondes
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                try {
                    MotivationalDialog dialog = new MotivationalDialog(MainActivity.this);
                    dialog.show();
                } catch (Exception e) {
                    // En cas d'erreur, on continue sans le dialog
                    Toast.makeText(MainActivity.this, "Erreur lors du chargement du dialog", Toast.LENGTH_SHORT).show();
                }
            }
        }, 2000);
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}