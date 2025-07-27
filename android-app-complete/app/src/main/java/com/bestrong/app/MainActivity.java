package com.bestrong.app;

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
                String baseUrl = "https://mybestrong.netlify.app";
                
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
                            // Fallback: ouvrir dans le navigateur par défaut
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW);
                                intent.setData(Uri.parse(url));
                                startActivity(intent);
                                return true;
                            } catch (Exception e2) {
                                Log.e(TAG, "Error with fallback browser", e2);
                            }
                        }
                    }
                } else if (url.startsWith("intent://")) {
                    // Liens intent Android - ouvrir directement
                    try {
                        Intent intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error opening intent link", e);
                    }
                } else if (url.startsWith("market://")) {
                    // Liens Google Play - ouvrir dans Play Store
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Error opening Play Store link", e);
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
        webView.loadUrl("https://mybestrong.netlify.app");
    }
    
    private void injectShareJavaScript() {
        String js = "// API de partage natif pour Android\n" +
            "window.AndroidShare = {\n" +
            "    share: function(title, text, url) {\n" +
            "        Android.shareContent(title, text, url);\n" +
            "    }\n" +
            "};\n" +
            "\n" +
            "// Override du bouton de partage\n" +
            "document.addEventListener('click', function(e) {\n" +
            "    if (e.target && e.target.closest('button') && \n" +
            "        e.target.closest('button').textContent.includes('Partager BE STRONG')) {\n" +
            "        e.preventDefault();\n" +
            "        \n" +
            "        const shareData = {\n" +
            "            title: '🚀 Rejoins BE STRONG et deviens une légende !',\n" +
            "            text: '🔥 Découvre BE STRONG : la plateforme éthique qui booste ta visibilité TikTok avec des échanges organiques, analytics et conseils d\\'optimisation ! Clique ici pour vivre l\\'expérience 👉',\n" +
            "            url: 'https://mybestrong.netlify.app'\n" +
            "        };\n" +
            "        \n" +
            "        // Utiliser l'API native Android\n" +
            "        if (window.AndroidShare) {\n" +
            "            window.AndroidShare.share(shareData.title, shareData.text, shareData.url);\n" +
            "        } else if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {\n" +
            "            navigator.share(shareData);\n" +
            "        } else {\n" +
            "            // Fallback vers copie\n" +
            "            const message = shareData.title + '\\n\\n' + shareData.text + ' ' + shareData.url;\n" +
            "            if (navigator.clipboard) {\n" +
            "                navigator.clipboard.writeText(message);\n" +
            "                alert('✅ Lien copié ! Partage-le avec tes amis');\n" +
            "            } else {\n" +
            "                alert('📱 Partage BE STRONG:\\n\\n' + message);\n" +
            "            }\n" +
            "        }\n" +
            "    }\n" +
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
}